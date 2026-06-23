import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
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

// Unterstützt mehrere Keys (Rotation bei Limit) und fällt auf den alten Einzel-Key zurück.
const KEYS: string[] = (
  (environment as { spoonacularApiKeys?: string[] }).spoonacularApiKeys ??
  [(environment as { spoonacularApiKey?: string }).spoonacularApiKey]
).filter((k): k is string => !!k);

// Cache: gespeicherte Antworten kosten keine API-Punkte mehr.
const CACHE_PREFIX = 'tf_cache_';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 Tage

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
  private platformId = inject(PLATFORM_ID);

  // ── Cache-Helfer ──────────────────────────────────────────────────────────

  private readCache<T>(key: string): T | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const entry = JSON.parse(raw) as { t: number; v: T };
      if (Date.now() - entry.t > CACHE_TTL_MS) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return entry.v;
    } catch {
      return null;
    }
  }

  private writeCache<T>(key: string, value: T): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), v: value }));
    } catch {
      // localStorage voll oder nicht verfügbar → einfach ignorieren
    }
  }

  /**
   * Führt einen GET aus und rotiert bei Erreichen des Tageslimits (HTTP 402)
   * automatisch zum nächsten Spoonacular-Key.
   */
  private getWithKeyRotation<T>(url: string, params: HttpParams, keyIndex = 0): Observable<T> {
    if (keyIndex >= KEYS.length) {
      return throwError(() => new Error('Alle Spoonacular-Keys haben das Tageslimit erreicht.'));
    }

    const withKey = params.set('apiKey', KEYS[keyIndex]);
    return this.http.get<T>(url, { params: withKey }).pipe(
      catchError((err: HttpErrorResponse) => {
        // 402 = Tageslimit erreicht, 401 = Key ungültig → nächsten Key versuchen
        const keyProblem = err.status === 402 || err.status === 401;
        if (keyProblem && keyIndex + 1 < KEYS.length) {
          return this.getWithKeyRotation<T>(url, params, keyIndex + 1);
        }
        return throwError(() => err);
      }),
    );
  }

  searchByName(name: string): Observable<RecipePreview[]> {
    const cacheKey = `search:name:${name.toLowerCase().trim()}`;
    const cached = this.readCache<RecipePreview[]>(cacheKey);
    if (cached) return of(cached);

    const params = new HttpParams()
      .set('query', name)
      .set('number', '10')
      .set('addRecipeInformation', 'false');

    return this.getWithKeyRotation<SpoonacularSearchResponse>(
      `${BASE}/recipes/complexSearch`,
      params,
    ).pipe(
      map((res) => res.results.map(this.toPreview)),
      tap((data) => this.writeCache(cacheKey, data)),
      catchError(() => of([])),
    );
  }

  searchByIngredient(ingredient: string): Observable<RecipePreview[]> {
    const cacheKey = `search:ing:${ingredient.toLowerCase().trim()}`;
    const cached = this.readCache<RecipePreview[]>(cacheKey);
    if (cached) return of(cached);

    const params = new HttpParams()
      .set('ingredients', ingredient)
      .set('number', '10')
      .set('ranking', '1');

    return this.getWithKeyRotation<SpoonacularSearchResponse>(
      `${BASE}/recipes/findByIngredients`,
      params,
    ).pipe(
      map((res: any) => (Array.isArray(res) ? res : (res.results ?? [])).map(this.toPreview)),
      tap((data) => this.writeCache(cacheKey, data)),
      catchError(() => of([])),
    );
  }

  getById(id: string): Observable<Recipe | null> {
    const cacheKey = `recipe:${id}`;
    const cached = this.readCache<Recipe>(cacheKey);
    if (cached) return of(cached);

    return this.getWithKeyRotation<SpoonacularRecipeDetail>(
      `${BASE}/recipes/${id}/information`,
      new HttpParams(),
    ).pipe(
      map((r) => this.toRecipe(r)),
      tap((data) => this.writeCache(cacheKey, data)),
      catchError(() => of(null)),
    );
  }

  getRandom(): Observable<Recipe> {
    const params = new HttpParams().set('number', '1');

    return this.getWithKeyRotation<{ recipes: SpoonacularRecipeDetail[] }>(
      `${BASE}/recipes/random`,
      params,
    ).pipe(map((res) => this.toRecipe(res.recipes[0])));
  }

  getCategories(): Observable<Category[]> {
    return of(CUISINE_CATEGORIES);
  }

  getByCategory(category: string): Observable<RecipePreview[]> {
    const cacheKey = `search:cat:${category.toLowerCase().trim()}`;
    const cached = this.readCache<RecipePreview[]>(cacheKey);
    if (cached) return of(cached);

    const params = new HttpParams().set('cuisine', category).set('number', '10');

    return this.getWithKeyRotation<SpoonacularSearchResponse>(
      `${BASE}/recipes/complexSearch`,
      params,
    ).pipe(
      map((res) => res.results.map(this.toPreview)),
      tap((data) => this.writeCache(cacheKey, data)),
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
