import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AiResponse } from '../models/chat.interface';

const STORAGE_KEY = 'tf_groq_key';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

@Injectable({ providedIn: 'root' })
export class AiService {
  private platformId = inject(PLATFORM_ID);

  private get apiKey(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    return localStorage.getItem(STORAGE_KEY) ?? '';
  }

  setApiKey(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    }
  }

  removeApiKey(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  async extractEnglishIngredients(userInput: string): Promise<string> {
    const prompt =
      'Extract food ingredients from this text and translate them to English. ' +
      'Return only a comma-separated list of English ingredient names, nothing else. ' +
      `Text: "${userInput}"`;
    const response = await this.callGroq(prompt);
    return response.text;
  }

  async summarizeRecipe(recipeName: string, instructions: string): Promise<string> {
    const prompt =
      `Fasse dieses Rezept "${recipeName}" in 2-3 Sätzen zusammen und gib den ` +
      `Schwierigkeitsgrad an (Einfach/Mittel/Schwer). ` +
      `Anweisungen: ${instructions.substring(0, 500)}`;
    const response = await this.callGroq(prompt);
    return response.text;
  }

  async suggestRecipe(): Promise<string> {
    const hour = new Date().getHours();
    const mealTime = hour < 11 ? 'Frühstück' : hour < 15 ? 'Mittagessen' : 'Abendessen';
    const prompt =
      `Schlage ein passendes Rezept für ${mealTime} vor. ` +
      'Nenne nur den Namen und einen kurzen Grund warum es passt.';
    const response = await this.callGroq(prompt);
    return response.text;
  }

  async generateRaw(prompt: string): Promise<string> {
    const response = await this.callGroq(prompt);
    return response.text;
  }

  private async callGroq(prompt: string): Promise<AiResponse> {
    if (!this.apiKey) {
      return { text: '', error: 'Kein API Key gesetzt.' };
    }

    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      if (data?.error) {
        console.error('Groq error:', data.error.message);
        return { text: '', error: data.error.message };
      }
      const text = data?.choices?.[0]?.message?.content?.trim() ?? '';
      return { text };
    } catch {
      return { text: '', error: 'Fehler bei der AI-Anfrage.' };
    }
  }
}
