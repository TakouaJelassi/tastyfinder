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

  /**
   * Freitext-Suche für den Chat: bewertet jedes Rezept danach, wie viele
   * Wörter der Anfrage in Titel, Zutaten, Küche, Kategorie oder Tags vorkommen.
   */
  searchSmart(queryText: string): Observable<RecipePreview[]> {
    const stop = new Set([
      'ich',
      'habe',
      'hab',
      'und',
      'oder',
      'was',
      'kann',
      'man',
      'kochen',
      'machen',
      'mit',
      'heute',
      'möchte',
      'will',
      'ein',
      'eine',
      'einen',
      'der',
      'die',
      'das',
      'für',
      'mir',
      'zeig',
      'zeige',
      'etwas',
      'gibt',
      'es',
      'aus',
      'noch',
      'nur',
      'auch',
      'rezept',
      'rezepte',
    ]);

    // Deutsche Begriffe → englische Küche/Tags im Datensatz
    const synonyms: Record<string, string> = {
      italienisch: 'italian',
      asiatisch: 'asian',
      mexikanisch: 'mexican',
      japanisch: 'japanese',
      indisch: 'indian',
      griechisch: 'greek',
      spanisch: 'spanish',
      amerikanisch: 'american',
      französisch: 'french',
      chinesisch: 'chinese',
      vegetarisch: 'vegetarian',
      vegan: 'vegan',
      scharf: 'spicy',
      suppe: 'soup',
      salat: 'salad',
      nudeln: 'noodles pasta',
    };

    const words = queryText
      .toLowerCase()
      .replace(/[^a-zäöüß\s]/g, ' ')
      .split(/\s+/)
      .map((w) => synonyms[w] ?? w)
      .join(' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stop.has(w));

    if (words.length === 0) return of([]);

    const scored = RECIPES.map((r) => {
      const haystack = [r.title, r.cuisine, r.category, r.tags, ...r.ingredients]
        .join(' ')
        .toLowerCase();
      const score = words.reduce((acc, w) => acc + (haystack.includes(w) ? 1 : 0), 0);
      return { r, score };
    })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => this.toPreview(x.r));

    return of(scored);
  }
}
