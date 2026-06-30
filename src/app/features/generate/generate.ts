import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai';
import { N8nService } from '../../core/services/n8n';
import { UserRecipeStore } from '../../core/stores/user-recipe.store';
import { GeneratedRecipeParser } from '../../core/services/generated-recipe-parser';
import { PromptBuilder } from '../../core/services/prompt-builder';
import { ErrorMapper } from '../../core/errors/error-mapper';
import { GeneratedRecipe, RecipePreferences } from '../../core/models/generated-recipe.interface';
import { ApiKeyBanner } from '../../shared/components/api-key-banner/api-key-banner';
import { Icon } from '../../shared/components/icon/icon';

interface IngredientInput {
  name: string;
  amount: string;
  unit: string;
}

@Component({
  selector: 'app-generate',
  imports: [FormsModule, ApiKeyBanner, Icon],
  templateUrl: './generate.html',
  styleUrl: './generate.scss',
})
export class Generate {
  private aiService = inject(AiService);
  private n8nService = inject(N8nService);
  private userRecipeStore = inject(UserRecipeStore);
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
  savedIds = signal<Set<string>>(new Set());
  error = signal('');

  units = ['g', 'kg', 'ml', 'L', 'pcs', 'tbsp', 'tsp', 'cup'];
  cuisines = ['German', 'Italian', 'Japanese', 'Indian', 'Gourmet', 'Fusion'];
  times: { value: RecipePreferences['time']; label: string }[] = [
    { value: 'quick', label: 'Quick (up to 20 min)' },
    { value: 'medium', label: 'Medium (20–45 min)' },
    { value: 'long', label: 'Elaborate (45+ min)' },
  ];
  diets: { value: RecipePreferences['diet']; label: string }[] = [
    { value: 'none', label: 'No restriction' },
    { value: 'vegetarian', label: 'Vegetarian' },
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
      this.error.set('Please enter at least one ingredient.');
      return;
    }
    if (!(await this.aiService.hasAiAccess())) {
      this.error.set('Please enable AI in the configuration section on this page.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.generatedRecipes.set([]);
    this.savedIds.set(new Set());

    const ingredientList = this.validIngredients
      .map((i) => `${i.amount} ${i.unit} ${i.name}`.trim())
      .join(', ');

    const prefs = this.preferences();
    const prompt = this.promptBuilder.buildRecipeListPrompt(ingredientList, prefs);

    try {
      const prefsText = `Servings: ${prefs.portions}, Time: ${prefs.time}, Cuisine: ${prefs.cuisine}, Diet: ${prefs.diet}`;
      let raw = '';
      try {
        raw = await this.n8nService.generateRecipe(ingredientList, prefsText);
      } catch {
        raw = await this.aiService.generateRaw(prompt);
      }
      if (!raw || raw.trim() === '') {
        this.error.set('No AI response received. Please check your Groq API key.');
        this.loading.set(false);
        return;
      }
      const recipes = this.recipeParser.parseRecipeList(raw);
      this.generatedRecipes.set(recipes);
      this.loading.set(false);
    } catch (e) {
      this.error.set(this.errorMapper.fromUnknown(e).message);
      console.error(e);
      this.loading.set(false);
    }
  }

  async saveRecipe(recipe: GeneratedRecipe, index: number): Promise<void> {
    const key = recipe.id ?? String(index);
    if (this.savedIds().has(key)) return;
    await this.userRecipeStore.save(recipe);
    this.savedIds.update((s) => new Set([...s, key]));
  }

  isSaved(recipe: GeneratedRecipe, index: number): boolean {
    return this.savedIds().has(recipe.id ?? String(index));
  }
}
