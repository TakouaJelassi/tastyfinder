import { Injectable } from '@angular/core';
import { RecipePreferences } from '../models/generated-recipe.interface';

@Injectable({ providedIn: 'root' })
export class PromptBuilder {
  buildRecipeListPrompt(ingredients: string, prefs: RecipePreferences): string {
    return `You are a professional chef. Generate exactly 3 distinct recipe suggestions based on these ingredients: ${ingredients}.

Preferences:
- Servings: ${prefs.portions}
- Time: ${this.timeLabel(prefs.time)}
- Cuisine: ${prefs.cuisine}
- Diet: ${prefs.diet}
- Cooking helpers: ${prefs.helpers}

Rules:
- Each recipe uses at least 70% of the provided ingredients
- Maximum 3 missing ingredients per recipe
- With multiple helpers: mark parallel steps accordingly
- Instructions are chronological and beginner-friendly

Reply ONLY with a valid JSON array without Markdown, exactly in this format:
[
  {
    "title": "Recipe name",
    "ingredients": ["Ingredient 1", "Ingredient 2"],
    "missingIngredients": ["missing ingredient"],
    "steps": [
      { "step": 1, "description": "Step description", "parallel": false, "assignedTo": 1 }
    ],
    "duration": "30 min",
    "difficulty": "Easy",
    "cuisine": "Italian",
    "diet": "Vegetarian",
    "portions": 2
  }
]`;
  }

  buildChatRecipePrompt(query: string): string {
    return `You are a professional chef. Create ONE recipe matching this request: "${query}".
Reply ONLY with a valid JSON object without Markdown, exactly in this format:
{
  "title": "Recipe name",
  "ingredients": ["Ingredient 1", "Ingredient 2"],
  "missingIngredients": [],
  "steps": [{ "step": 1, "description": "Step", "parallel": false, "assignedTo": 1 }],
  "duration": "30 min",
  "difficulty": "Easy",
  "cuisine": "Italian",
  "diet": "none",
  "portions": 2
}`;
  }

  private timeLabel(time: RecipePreferences['time']): string {
    if (time === 'quick') return 'up to 20 min';
    if (time === 'medium') return '20–45 min';
    return '45+ min';
  }
}
