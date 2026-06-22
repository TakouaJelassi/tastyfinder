import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

const N8N_WEBHOOK_URL = '/n8n/webhook/generate-recipe';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';
const STORAGE_KEY = 'tf_gemini_key';

@Injectable({ providedIn: 'root' })
export class N8nService {
  private platformId = inject(PLATFORM_ID);

  async generateRecipe(ingredients: string, preferences: string): Promise<string> {
    if (environment.production) {
      return this.generateViaGemini(ingredients, preferences);
    }
    return this.generateViaN8n(ingredients, preferences);
  }

  private async generateViaN8n(ingredients: string, preferences: string): Promise<string> {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients, preferences }),
    });

    if (!response.ok) throw new Error(`n8n Fehler: ${response.status}`);

    const data = await response.json();
    return JSON.stringify(Array.isArray(data) ? data : [data]);
  }

  private async generateViaGemini(ingredients: string, preferences: string): Promise<string> {
    const apiKey = isPlatformBrowser(this.platformId)
      ? localStorage.getItem(STORAGE_KEY) ?? ''
      : '';

    if (!apiKey) throw new Error('Kein API Key gesetzt.');

    const prompt = `Du bist ein Profi-Koch. Generiere genau 3 unterschiedliche Rezeptvorschläge basierend auf diesen Zutaten: ${ingredients}.

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

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) throw new Error(`Gemini Fehler: ${response.status}`);

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
  }
}
