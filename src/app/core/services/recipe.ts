import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Recipe, RecipePreview, Category,
  SpoonacularSearchResponse, SpoonacularRecipeDetail
} from '../models/recipe.interface';

const BASE = 'https://api.spoonacular.com';
const KEY = environment.spoonacularApiKey;

const CUISINE_CATEGORIES: Category[] = [
  { idCategory: '1', strCategory: 'Italian', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '2', strCategory: 'Asian', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '3', strCategory: 'Mexican', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '4', strCategory: 'American', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '5', strCategory: 'French', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '6', strCategory: 'Mediterranean', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '7', strCategory: 'Indian', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '8', strCategory: 'Japanese', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '9', strCategory: 'Chinese', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '10', strCategory: 'Greek', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '11', strCategory: 'Spanish', strCategoryThumb: '', strCategoryDescription: '' },
  { idCategory: '12', strCategory: 'Middle Eastern', strCategoryThumb: '', strCategoryDescription: '' },
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
        map(res => res.results.map(this.toPreview)),
        catchError(() => of([]))
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
        map((res: any) => (Array.isArray(res) ? res : res.results ?? []).map(this.toPreview)),
        catchError(() => of([]))
      );
  }

  getById(id: string): Observable<Recipe | null> {
    const params = new HttpParams().set('apiKey', KEY);

    return this.http
      .get<SpoonacularRecipeDetail>(`${BASE}/recipes/${id}/information`, { params })
      .pipe(
        map(r => this.toRecipe(r)),
        catchError(() => of(null))
      );
  }

  getRandom(): Observable<Recipe> {
    const params = new HttpParams().set('apiKey', KEY).set('number', '1');

    return this.http
      .get<{ recipes: SpoonacularRecipeDetail[] }>(`${BASE}/recipes/random`, { params })
      .pipe(map(res => this.toRecipe(res.recipes[0])));
  }

  getCategories(): Observable<Category[]> {
    return of(CUISINE_CATEGORIES);
  }

  getByCategory(category: string): Observable<RecipePreview[]> {
    const params = new HttpParams()
      .set('apiKey', KEY)
      .set('cuisine', category)
      .set('number', '20');

    return this.http
      .get<SpoonacularSearchResponse>(`${BASE}/recipes/complexSearch`, { params })
      .pipe(
        map(res => res.results.map(this.toPreview)),
        catchError(() => of([]))
      );
  }

  private toPreview(r: any): RecipePreview {
    return {
      idMeal: String(r.id),
      strMeal: r.title,
      strMealThumb: r.image ?? '',
    };
  }

  private toRecipe(r: SpoonacularRecipeDetail): Recipe {
    const ingredients = r.extendedIngredients?.map(i => i.name) ?? [];
    const measures = r.extendedIngredients?.map(i => `${i.amount} ${i.unit}`.trim()) ?? [];

    const instructions = r.instructions
      ? r.instructions.replace(/<[^>]*>/g, '').trim()
      : 'Keine Anleitung verfügbar.';

    return {
      idMeal: String(r.id),
      strMeal: r.title,
      strMealThumb: r.image,
      strCategory: r.dishTypes?.[0] ?? '',
      strArea: r.cuisines?.[0] ?? '',
      strInstructions: instructions,
      strYoutube: '',
      strTags: r.diets?.join(', ') ?? '',
      ingredients,
      measures,
    };
  }
}
