import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Recipe, RecipePreview, Category } from '../models/recipe.interface';
import { RECIPES } from '../data/recipes.data';

// Kategorien aus dem lokalen Datensatz ableiten (eindeutige Küchen).
const CUISINE_CATEGORIES: Category[] = Array.from(
  new Set(RECIPES.map((r) => r.cuisine).filter(Boolean)),
).map((name, i) => ({ id: String(i + 1), name }));

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private toPreview(r: Recipe): RecipePreview {
    return { id: r.id, title: r.title, image: r.image };
  }

  searchByName(name: string): Observable<RecipePreview[]> {
    const term = name.toLowerCase().trim();
    const results = RECIPES.filter((r) => !term || r.title.toLowerCase().includes(term)).map((r) =>
      this.toPreview(r),
    );
    return of(results);
  }

  searchByIngredient(ingredient: string): Observable<RecipePreview[]> {
    const term = ingredient.toLowerCase().trim();
    const results = RECIPES.filter((r) =>
      r.ingredients.some((i) => i.toLowerCase().includes(term)),
    ).map((r) => this.toPreview(r));
    return of(results);
  }

  getById(id: string): Observable<Recipe | null> {
    return of(RECIPES.find((r) => r.id === id) ?? null);
  }

  getRandom(): Observable<Recipe> {
    return of(RECIPES[Math.floor(Math.random() * RECIPES.length)]);
  }

  getCategories(): Observable<Category[]> {
    return of(CUISINE_CATEGORIES);
  }

  getByCategory(category: string): Observable<RecipePreview[]> {
    const term = category.toLowerCase().trim();
    const results = RECIPES.filter((r) => r.cuisine.toLowerCase() === term).map((r) =>
      this.toPreview(r),
    );
    return of(results);
  }
}
