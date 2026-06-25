import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const N8N_WEBHOOK_URL = '/n8n/webhook/generate-recipe';
const PROXY_CHAT_URL = '/api/groq/chat';

interface GroqProxyResponse {
  text?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class N8nService {
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
      this.http.post<GroqProxyResponse>(
        PROXY_CHAT_URL,
        { prompt },
        { headers: { 'Content-Type': 'application/json' } },
      ),
    );

    if (data.error) throw new Error(data.error);
    return data.text ?? '[]';
  }
}
