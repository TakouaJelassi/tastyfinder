import { Injectable } from '@angular/core';
import { RecipePreferences } from '../models/generated-recipe.interface';

@Injectable({ providedIn: 'root' })
export class PromptBuilder {
  buildRecipeListPrompt(ingredients: string, prefs: RecipePreferences): string {
    return `Du bist ein Profi-Koch. Generiere genau 3 unterschiedliche Rezeptvorschläge basierend auf diesen Zutaten: ${ingredients}.

Präferenzen:
- Portionen: ${prefs.portions}
- Zeit: ${this.timeLabel(prefs.time)}
- Küche: ${prefs.cuisine}
- Ernährung: ${prefs.diet}
- Kochhelfer: ${prefs.helpers}

Regeln:
- Jedes Rezept nutzt mindestens 70% der angegebenen Zutaten
- Maximal 3 fehlende Zutaten pro Rezept
- Bei mehreren Helfern: parallele Schritte kennzeichnen
- Anleitung ist chronologisch und anfängerfreundlich

Antworte NUR mit einem validen JSON Array ohne Markdown, genau in diesem Format:
[
  {
    "title": "Rezeptname",
    "ingredients": ["Zutat 1", "Zutat 2"],
    "missingIngredients": ["fehlende Zutat"],
    "steps": [
      { "step": 1, "description": "Schritt Beschreibung", "parallel": false, "assignedTo": 1 }
    ],
    "duration": "30 Min",
    "difficulty": "Einfach",
    "cuisine": "Italienisch",
    "diet": "Vegetarisch",
    "portions": 2
  }
]`;
  }

  buildChatRecipePrompt(query: string): string {
    return `Du bist ein Profi-Koch. Erstelle EIN Rezept passend zu dieser Anfrage: "${query}".
Antworte NUR mit einem validen JSON-Objekt ohne Markdown, genau in diesem Format:
{
  "title": "Rezeptname",
  "ingredients": ["Zutat 1", "Zutat 2"],
  "missingIngredients": [],
  "steps": [{ "step": 1, "description": "Schritt", "parallel": false, "assignedTo": 1 }],
  "duration": "30 Min",
  "difficulty": "Einfach",
  "cuisine": "Italienisch",
  "diet": "none",
  "portions": 2
}`;
  }

  private timeLabel(time: RecipePreferences['time']): string {
    if (time === 'quick') return 'bis 20 Min';
    if (time === 'medium') return '20-45 Min';
    return '45+ Min';
  }
}
