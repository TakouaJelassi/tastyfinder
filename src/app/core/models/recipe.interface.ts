export interface RecipePreview {
  id: string;
  title: string;
  image: string;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  category: string;
  cuisine: string;
  instructions: string;
  video: string;
  tags: string;
  ingredients: string[];
  measures: string[];
  cuisines: string[];
  diets: string[];
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  youtube?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
}

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type MealPlan = Record<WeekDay, string[]>;

export interface SpoonacularSearchResult {
  id: number;
  title: string;
  image: string;
}

export interface SpoonacularSearchResponse {
  results: SpoonacularSearchResult[];
}

export interface SpoonacularIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface SpoonacularRecipeDetail {
  id: number;
  title: string;
  image: string;
  dishTypes: string[];
  cuisines: string[];
  diets: string[];
  instructions: string;
  extendedIngredients: SpoonacularIngredient[];
  readyInMinutes: number;
  servings: number;
  summary: string;
}
