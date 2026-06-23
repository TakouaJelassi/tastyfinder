import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai';
import { N8nService } from '../../core/services/n8n';
import { FirestoreService } from '../../core/services/firestore';
import { GeneratedRecipe, RecipePreferences } from '../../core/models/generated-recipe.interface';

interface IngredientInput {
  name: string;
  amount: string;
  unit: string;
}

@Component({
  selector: 'app-generate',
  imports: [FormsModule],
  templateUrl: './generate.html',
  styleUrl: './generate.scss',
})
export class Generate {
  private aiService = inject(AiService);
  private n8nService = inject(N8nService);
  private firestoreService = inject(FirestoreService);

  ingredients = signal<IngredientInput[]>([{ name: '', amount: '', unit: 'g' }]);
  preferences = signal<RecipePreferences>({
    portions: 2,
    time: 'medium',
    cuisine: 'Fusion',
    diet: 'none',
    helpers: 1,
  });

  generatedRecipes = signal<GeneratedRecipe[]>([]);
  loading = signal(false);
  saved = signal(false);
  error = signal('');

  units = ['g', 'kg', 'ml', 'L', 'Stück', 'EL', 'TL', 'Tasse'];
  cuisines = ['Deutsch', 'Italienisch', 'Japanisch', 'Indisch', 'Gourmet', 'Fusion'];
  times: { value: RecipePreferences['time']; label: string }[] = [
    { value: 'quick', label: 'Schnell (bis 20 Min)' },
    { value: 'medium', label: 'Mittel (20–45 Min)' },
    { value: 'long', label: 'Aufwendig (45+ Min)' },
  ];
  diets: { value: RecipePreferences['diet']; label: string }[] = [
    { value: 'none', label: 'Keine Einschränkung' },
    { value: 'vegetarian', label: 'Vegetarisch' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'keto', label: 'Keto' },
  ];

  addIngredient(): void {
    this.ingredients.update((list) => [...list, { name: '', amount: '', unit: 'g' }]);
  }

  removeIngredient(index: number): void {
    this.ingredients.update((list) => list.filter((_, i) => i !== index));
  }

  updateIngredient(index: number, field: keyof IngredientInput, value: string): void {
    this.ingredients.update((list) =>
      list.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  updatePreference<K extends keyof RecipePreferences>(key: K, value: RecipePreferences[K]): void {
    this.preferences.update((p) => ({ ...p, [key]: value }));
  }

  get validIngredients(): IngredientInput[] {
    return this.ingredients().filter((i) => i.name.trim());
  }

  async generate(): Promise<void> {
    if (this.validIngredients.length === 0) {
      this.error.set('Bitte mindestens eine Zutat eingeben.');
      return;
    }
    if (!this.aiService.hasApiKey()) {
      this.error.set('Bitte zuerst einen Groq API Key oben eingeben.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.generatedRecipes.set([]);
    this.saved.set(false);

    const ingredientList = this.validIngredients
      .map((i) => `${i.amount} ${i.unit} ${i.name}`.trim())
      .join(', ');

    const prefs = this.preferences();
    const prompt = `Du bist ein Profi-Koch. Generiere genau 3 unterschiedliche Rezeptvorschläge basierend auf diesen Zutaten: ${ingredientList}.

Präferenzen:
- Portionen: ${prefs.portions}
- Zeit: ${prefs.time === 'quick' ? 'bis 20 Min' : prefs.time === 'medium' ? '20-45 Min' : '45+ Min'}
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

    try {
      const prefsText = `Portionen: ${prefs.portions}, Zeit: ${prefs.time}, Küche: ${prefs.cuisine}, Ernährung: ${prefs.diet}`;
      let raw = '';
      try {
        raw = await this.n8nService.generateRecipe(ingredientList, prefsText);
      } catch {
        raw = await this.aiService.generateRaw(prompt);
      }
      if (!raw || raw.trim() === '') {
        this.error.set('Kein API Key aktiv oder ungültig. Bitte Groq API Key oben eingeben.');
        this.loading.set(false);
        return;
      }
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const recipes: GeneratedRecipe[] = JSON.parse(cleaned);
      this.generatedRecipes.set(recipes);
      this.loading.set(false);
      this.saveAll(recipes);
    } catch (e) {
      this.error.set('Fehler beim Generieren. Bitte nochmal versuchen.');
      console.error(e);
      this.loading.set(false);
    }
  }

  private async saveAll(recipes: GeneratedRecipe[]): Promise<void> {
    for (const recipe of recipes) {
      await this.firestoreService.saveRecipe(recipe);
    }
    this.saved.set(true);
  }
}
