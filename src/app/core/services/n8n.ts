import { Injectable } from '@angular/core';

const N8N_WEBHOOK_URL = '/n8n/webhook/generate-recipe';

@Injectable({ providedIn: 'root' })
export class N8nService {
  async generateRecipe(ingredients: string, preferences: string): Promise<string> {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients, preferences }),
    });

    if (!response.ok) {
      throw new Error(`n8n Fehler: ${response.status}`);
    }

    const data = await response.json();
    return JSON.stringify([data]);
  }
}
