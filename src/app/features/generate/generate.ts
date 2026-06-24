import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai';
import { N8nService } from '../../core/services/n8n';
import { FirestoreService } from '../../core/services/firestore';
import { GeneratedRecipeParser } from '../../core/services/generated-recipe-parser';
import { PromptBuilder } from '../../core/services/prompt-builder';
import { ErrorMapper } from '../../core/errors/error-mapper';
import { GeneratedRecipe, RecipePreferences } from '../../core/models/generated-recipe.interface';
import { ApiKeyBanner } from '../../shared/components/api-key-banner/api-key-banner';

interface IngredientInput {
  name: string;
  amount: string;
  unit: string;
}

@Component({
  selector: 'app-generate',
  imports: [FormsModule, ApiKeyBanner],
  templateUrl: './generate.html',
  styleUrl: './generate.scss',
})
export class Generate {
  private aiService = inject(AiService);
  private n8nService = inject(N8nService);
  private firestoreService = inject(FirestoreService);
  private recipeParser = inject(GeneratedRecipeParser);
  private promptBuilder = inject(PromptBuilder);
  private errorMapper = inject(ErrorMapper);

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
      this.error.set('Bitte aktiviere AI in der Konfiguration auf dieser Seite.');
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
    const prompt = this.promptBuilder.buildRecipeListPrompt(ingredientList, prefs);

    try {
      const prefsText = `Portionen: ${prefs.portions}, Zeit: ${prefs.time}, Küche: ${prefs.cuisine}, Ernährung: ${prefs.diet}`;
      let raw = '';
      try {
        raw = await this.n8nService.generateRecipe(ingredientList, prefsText);
      } catch {
        raw = await this.aiService.generateRaw(prompt);
      }
      if (!raw || raw.trim() === '') {
        this.error.set('Kein AI-Ergebnis erhalten. Bitte pruefe deinen Groq API Key.');
        this.loading.set(false);
        return;
      }
      const recipes = this.recipeParser.parseRecipeList(raw);
      this.generatedRecipes.set(recipes);
      this.loading.set(false);
      this.saveAll(recipes);
    } catch (e) {
      this.error.set(this.errorMapper.fromUnknown(e).message);
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
