import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const N8N_WEBHOOK_URL = '/n8n/webhook/generate-recipe';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const STORAGE_KEY = 'tf_groq_key';
const MODEL = 'llama-3.3-70b-versatile';

interface GroqChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

@Injectable({ providedIn: 'root' })
export class N8nService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  async generateRecipe(ingredients: string, preferences: string): Promise<string> {
    if (environment.production) {
      return this.generateViaGroq(ingredients, preferences);
    }
    return this.generateViaN8n(ingredients, preferences);
  }

  private async generateViaN8n(ingredients: string, preferences: string): Promise<string> {
    const data = await firstValueFrom(
      this.http.post<unknown>(N8N_WEBHOOK_URL, { ingredients, preferences }),
    );
    return JSON.stringify(Array.isArray(data) ? data : [data]);
  }

  private async generateViaGroq(ingredients: string, preferences: string): Promise<string> {
    const apiKey = isPlatformBrowser(this.platformId)
      ? (localStorage.getItem(STORAGE_KEY) ?? '')
      : '';

    if (!apiKey) throw new Error('Kein API Key gesetzt.');

    const prompt = `Du bist ein Profi-Koch. Generiere genau 3 unterschiedliche Rezeptvorschläge \
basierend auf diesen Zutaten: ${ingredients}.

Präferenzen: ${preferences}

Antworte NUR mit einem validen JSON Array ohne Markdown, genau in diesem Format:
[
  {
    "title": "Rezeptname",
    "ingredients": ["Zutat 1"],
    "missingIngredients": [],
    "steps": [{ "step": 1, "description": "Schritt", "parallel": false, "assignedTo": 1 }],
    "duration": "30 Min",
    "difficulty": "Einfach",
    "cuisine": "Fusion",
    "diet": "none",
    "portions": 2
  }
]`;

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
            Authorization: `Bearer ${apiKey}`,
          },
        },
      ),
    );

    return data?.choices?.[0]?.message?.content ?? '[]';
  }
}
