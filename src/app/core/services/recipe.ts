import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Recipe, RecipePreview, Category, MealDbResponse, RawMeal } from '../models/recipe.interface';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private http = inject(HttpClient);
  private baseUrl = 'https://www.themealdb.com/api/json/v1/1';

  searchByName(name: string): Observable<RecipePreview[]> {
    return this.http
      .get<MealDbResponse<RecipePreview>>(`${this.baseUrl}/search.php?s=${name}`)
      .pipe(map(res => res.meals ?? []));
  }

  searchByIngredient(ingredient: string): Observable<RecipePreview[]> {
    return this.http
      .get<MealDbResponse<RecipePreview>>(`${this.baseUrl}/filter.php?i=${ingredient}`)
      .pipe(map(res => res.meals ?? []));
  }

  getById(id: string): Observable<Recipe | null> {
    return this.http
      .get<MealDbResponse<RawMeal>>(`${this.baseUrl}/lookup.php?i=${id}`)
      .pipe(map((res: MealDbResponse<RawMeal>) => res.meals ? this.mapRecipe(res.meals[0]) : null));
  }

  getRandom(): Observable<Recipe> {
    return this.http
      .get<MealDbResponse<RawMeal>>(`${this.baseUrl}/random.php`)
      .pipe(map((res: MealDbResponse<RawMeal>) => this.mapRecipe(res.meals![0])));
  }

  getCategories(): Observable<Category[]> {
    return this.http
      .get<{ categories: Category[] }>(`${this.baseUrl}/categories.php`)
      .pipe(map(res => res.categories ?? []));
  }

  getByCategory(category: string): Observable<RecipePreview[]> {
    return this.http
      .get<MealDbResponse<RecipePreview>>(`${this.baseUrl}/filter.php?c=${category}`)
      .pipe(map((res: MealDbResponse<RecipePreview>) => res.meals ?? []));
  }

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
