export interface RecipePreview {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export interface Recipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strYoutube: string;
  strTags: string;
  ingredients: string[];
  measures: string[];
}

export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

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

export interface MealDbResponse<T> {
  meals: T[] | null;
}

export interface RawMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strYoutube: string;
  strTags: string;
  [key: string]: string;
}
