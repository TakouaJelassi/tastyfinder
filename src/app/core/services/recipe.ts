import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Recipe,
  RecipePreview,
  Category,
  SpoonacularSearchResponse,
  SpoonacularSearchResult,
  SpoonacularRecipeDetail,
} from '../models/recipe.interface';

const BASE = 'https://api.spoonacular.com';
const KEY = environment.spoonacularApiKey;

const CUISINE_CATEGORIES: Category[] = [
  { id: '1', name: 'Italian' },
  { id: '2', name: 'Asian' },
  { id: '3', name: 'Mexican' },
  { id: '4', name: 'American' },
  { id: '5', name: 'French' },
  { id: '6', name: 'Mediterranean' },
  { id: '7', name: 'Indian' },
  { id: '8', name: 'Japanese' },
  { id: '9', name: 'Chinese' },
  { id: '10', name: 'Greek' },
  { id: '11', name: 'Spanish' },
  { id: '12', name: 'Middle Eastern' },
];

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private http = inject(HttpClient);

  searchByName(name: string): Observable<RecipePreview[]> {
    const params = new HttpParams()
      .set('apiKey', KEY)
      .set('query', name)
      .set('number', '20')
      .set('addRecipeInformation', 'false');

    return this.http
      .get<SpoonacularSearchResponse>(`${BASE}/recipes/complexSearch`, { params })
      .pipe(
        map((res) => res.results.map(this.toPreview)),
        catchError(() => of([])),
      );
  }

  searchByIngredient(ingredient: string): Observable<RecipePreview[]> {
    const params = new HttpParams()
      .set('apiKey', KEY)
      .set('ingredients', ingredient)
      .set('number', '20')
      .set('ranking', '1');

    return this.http
      .get<SpoonacularSearchResponse>(`${BASE}/recipes/findByIngredients`, { params })
      .pipe(
        map((res: any) => (Array.isArray(res) ? res : (res.results ?? [])).map(this.toPreview)),
        catchError(() => of([])),
      );
  }

  getById(id: string): Observable<Recipe | null> {
    const params = new HttpParams().set('apiKey', KEY);

    return this.http
      .get<SpoonacularRecipeDetail>(`${BASE}/recipes/${id}/information`, { params })
      .pipe(
        map((r) => this.toRecipe(r)),
        catchError(() => of(null)),
      );
  }

  getRandom(): Observable<Recipe> {
    const params = new HttpParams().set('apiKey', KEY).set('number', '1');

    return this.http
      .get<{ recipes: SpoonacularRecipeDetail[] }>(`${BASE}/recipes/random`, { params })
      .pipe(map((res) => this.toRecipe(res.recipes[0])));
  }

  getCategories(): Observable<Category[]> {
    return of(CUISINE_CATEGORIES);
  }

  getByCategory(category: string): Observable<RecipePreview[]> {
    const params = new HttpParams().set('apiKey', KEY).set('cuisine', category).set('number', '20');

    return this.http
      .get<SpoonacularSearchResponse>(`${BASE}/recipes/complexSearch`, { params })
      .pipe(
        map((res) => res.results.map(this.toPreview)),
        catchError(() => of([])),
      );
  }

  private toPreview(r: SpoonacularSearchResult): RecipePreview {
    return {
      id: String(r.id),
      title: r.title,
      image: r.image ?? '',
    };
  }

  private toRecipe(r: SpoonacularRecipeDetail): Recipe {
    const ingredients = r.extendedIngredients?.map((i) => i.name) ?? [];
    const measures = r.extendedIngredients?.map((i) => `${i.amount} ${i.unit}`.trim()) ?? [];

    const instructions = r.instructions
      ? r.instructions.replace(/<[^>]*>/g, '').trim()
      : 'Keine Anleitung verfügbar.';

    return {
      id: String(r.id),
      title: r.title,
      image: r.image,
      category: r.dishTypes?.[0] ?? '',
      cuisine: r.cuisines?.[0] ?? '',
      instructions,
      video: '',
      tags: r.diets?.join(', ') ?? '',
      ingredients,
      measures,
    };
  }
}
