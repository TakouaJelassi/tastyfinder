import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AiResponse } from '../models/chat.interface';

const STORAGE_KEY = 'tf_gemini_key';

@Injectable({ providedIn: 'root' })
export class AiService {
  private platformId = inject(PLATFORM_ID);
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

  private get apiKey(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    return localStorage.getItem(STORAGE_KEY) ?? '';
  }

  /** Persist Gemini API key to localStorage. */
  setApiKey(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    }
  }

  /** Remove Gemini API key from localStorage. */
  removeApiKey(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  /** Extract and translate ingredients from user text to English via Gemini. */
  async extractEnglishIngredients(userInput: string): Promise<string> {
    const prompt = `Extract food ingredients from this text and translate them to English. Return only a comma-separated list of English ingredient names, nothing else. Text: "${userInput}"`;
    const response = await this.callGemini(prompt);
    return response.text;
  }

  async summarizeRecipe(recipeName: string, instructions: string): Promise<string> {
    const prompt = `Fasse dieses Rezept "${recipeName}" in 2-3 Sätzen zusammen und gib den Schwierigkeitsgrad an (Einfach/Mittel/Schwer). Anweisungen: ${instructions.substring(0, 500)}`;
    const response = await this.callGemini(prompt);
    return response.text;
  }

  async suggestRecipe(): Promise<string> {
    const hour = new Date().getHours();
    const mealTime = hour < 11 ? 'Frühstück' : hour < 15 ? 'Mittagessen' : 'Abendessen';
    const prompt = `Schlage ein passendes Rezept für ${mealTime} vor. Nenne nur den Namen und einen kurzen Grund warum es passt.`;
    const response = await this.callGemini(prompt);
    return response.text;
  }

  /** Send a raw prompt to Gemini and return the text response. */
  async generateRaw(prompt: string): Promise<string> {
    const response = await this.callGemini(prompt);
    return response.text;
  }

  private async callGemini(prompt: string): Promise<AiResponse> {
    if (!this.apiKey) {
      return { text: '', error: 'Kein API Key gesetzt.' };
    }

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      const data = await response.json();
      console.log('Gemini response:', JSON.stringify(data));
      if (data?.error) {
        console.error('Gemini error:', data.error.message);
        return { text: '', error: data.error.message };
      }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
      return { text };
    } catch {
      return { text: '', error: 'Fehler bei der AI-Anfrage.' };
    }
  }
}
