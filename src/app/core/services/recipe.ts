import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Recipe, RecipePreview, Category, MealDbResponse, RawMeal } from '../models/recipe.interface';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private http = inject(HttpClient);
  private baseUrl = 'https://www.themealdb.com/api/json/v1/1';

  /** Search recipes by name using MealDB API. */
  searchByName(name: string): Observable<RecipePreview[]> {
    return this.http
      .get<MealDbResponse<RecipePreview>>(`${this.baseUrl}/search.php?s=${name}`)
      .pipe(map(res => res.meals ?? []));
  }

  /** Search recipes by a single ingredient using MealDB filter API. */
  searchByIngredient(ingredient: string): Observable<RecipePreview[]> {
    return this.http
      .get<MealDbResponse<RecipePreview>>(`${this.baseUrl}/filter.php?i=${ingredient}`)
      .pipe(map(res => res.meals ?? []));
  }

  /** Fetch full recipe details by MealDB ID. */
  getById(id: string): Observable<Recipe | null> {
    return this.http
      .get<MealDbResponse<RawMeal>>(`${this.baseUrl}/lookup.php?i=${id}`)
      .pipe(map((res: MealDbResponse<RawMeal>) => res.meals ? this.mapRecipe(res.meals[0]) : null));
  }

  /** Fetch a random recipe from MealDB. */
  getRandom(): Observable<Recipe> {
    return this.http
      .get<MealDbResponse<RawMeal>>(`${this.baseUrl}/random.php`)
      .pipe(map((res: MealDbResponse<RawMeal>) => this.mapRecipe(res.meals![0])));
  }

  /** Fetch all recipe categories from MealDB. */
  getCategories(): Observable<Category[]> {
    return this.http
      .get<{ categories: Category[] }>(`${this.baseUrl}/categories.php`)
      .pipe(map(res => res.categories ?? []));
  }

  /** Fetch recipes filtered by category name. */
  getByCategory(category: string): Observable<RecipePreview[]> {
    return this.http
      .get<MealDbResponse<RecipePreview>>(`${this.baseUrl}/filter.php?c=${category}`)
      .pipe(map((res: MealDbResponse<RecipePreview>) => res.meals ?? []));
  }

  /** Maps raw MealDB response to typed Recipe model, extracting up to 20 ingredients. */
  private mapRecipe(raw: RawMeal): Recipe {
    const ingredients: string[] = [];
    const measures: string[] = [];

    for (let i = 1; i <= 20; i++) {
      const ingredient = raw[`strIngredient${i}`]?.trim();
      const measure = raw[`strMeasure${i}`]?.trim();
      if (ingredient) {
        ingredients.push(ingredient);
        measures.push(measure ?? '');
      }
    }

    return {
      idMeal: raw.idMeal,
      strMeal: raw.strMeal,
      strMealThumb: raw.strMealThumb,
      strCategory: raw.strCategory,
      strArea: raw.strArea,
      strInstructions: raw.strInstructions,
      strYoutube: raw.strYoutube,
      strTags: raw.strTags,
      ingredients,
      measures,
    };
  }
}
