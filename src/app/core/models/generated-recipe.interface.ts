import { Timestamp } from '@angular/fire/firestore';

export interface RecipePreferences {
  portions: number;
  time: 'quick' | 'medium' | 'long';
  cuisine: string;
  diet: 'none' | 'vegetarian' | 'vegan' | 'keto';
  helpers: number;
}

export interface RecipeStep {
  step: number;
  description: string;
  parallel?: boolean;
  assignedTo?: number;
}

export interface GeneratedRecipe {
  id?: string;
  title: string;
  ingredients: string[];
  missingIngredients: string[];
  steps: RecipeStep[];
  duration: string;
  difficulty: string;
  cuisine: string;
  diet: string;
  portions: number;
  createdAt?: Timestamp;
}
