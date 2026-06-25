export interface RecipePreview {
  id: string;
  title: string;
  image: string;
  category?: string;
  cuisine?: string;
  tags?: string;
  diets?: string[];
  readyInMinutes?: number;
  servings?: number;
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
