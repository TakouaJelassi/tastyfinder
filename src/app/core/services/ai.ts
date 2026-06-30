import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AiResponse } from '../models/chat.interface';

const STORAGE_KEY = 'tf_groq_key';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const PROXY_STATUS_URL = '/api/groq/status';
const PROXY_CHAT_URL = '/api/groq/chat';
const MODEL = 'llama-3.3-70b-versatile';

interface GroqChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

interface GroqProxyStatus {
  configured?: boolean;
}

interface GroqProxyResponse {
  text?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private proxyAvailable: boolean | null = null;

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

  async hasAiAccess(): Promise<boolean> {
    return (await this.hasServerProxy()) || this.hasApiKey();
  }

  async hasServerProxy(): Promise<boolean> {
    if (this.proxyAvailable !== null) return this.proxyAvailable;

    try {
      const status = await firstValueFrom(
        this.http.get<GroqProxyStatus>(PROXY_STATUS_URL, {
          headers: { Accept: 'application/json' },
        }),
      );
      this.proxyAvailable = status.configured === true;
    } catch {
      this.proxyAvailable = false;
    }

    return this.proxyAvailable;
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
      `Summarise the recipe "${recipeName}" in 2-3 sentences and indicate the difficulty ` +
      `(Easy/Medium/Hard). Instructions: ${instructions.substring(0, 500)}`;
    const response = await this.callGroq(prompt);
    return response.text;
  }

  async suggestRecipe(): Promise<string> {
    const hour = new Date().getHours();
    const mealTime = hour < 11 ? 'Breakfast' : hour < 15 ? 'Lunch' : 'Dinner';
    const prompt =
      `Suggest a suitable recipe for ${mealTime}. ` +
      'Give only the name and a short reason why it fits.';
    const response = await this.callGroq(prompt);
    return response.text;
  }

  async generateRaw(prompt: string): Promise<string> {
    const response = await this.callGroq(prompt);
    return response.text;
  }

  private async callGroq(prompt: string): Promise<AiResponse> {
    const proxyResponse = await this.callServerProxy(prompt);
    if (proxyResponse.text) return proxyResponse;

    if (!this.apiKey) {
      return { text: '', error: 'No API key set.' };
    }

    try {
      const data = await firstValueFrom(
        this.http.post<GroqChatResponse>(
          GROQ_URL,
          {
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
          },
        ),
      );

      if (data?.error) {
        console.error('Groq error:', data.error.message);
        return { text: '', error: data.error.message ?? 'Groq could not respond.' };
      }
      const text = data?.choices?.[0]?.message?.content?.trim() ?? '';
      return { text };
    } catch {
      return { text: '', error: 'AI request failed.' };
    }
  }

  private async callServerProxy(prompt: string): Promise<AiResponse & { error?: string }> {
    if (!(await this.hasServerProxy())) return { text: '', error: 'proxy-unavailable' };

    try {
      const response = await firstValueFrom(
        this.http.post<GroqProxyResponse>(
          PROXY_CHAT_URL,
          { prompt },
          { headers: { 'Content-Type': 'application/json' } },
        ),
      );

      if (response.error) return { text: '', error: response.error };
      return { text: response.text?.trim() ?? '' };
    } catch {
      this.proxyAvailable = false;
      return { text: '', error: 'proxy-unavailable' };
    }
  }
}
