import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Recipe, RecipePreview, Category } from '../models/recipe.interface';
import { RECIPES } from '../data/recipes.data';

// Derive unique cuisine categories from the local dataset.
const CUISINE_CATEGORIES: Category[] = Array.from(
  new Set(RECIPES.map((r) => r.cuisine).filter(Boolean)),
).map((name, i) => ({ id: String(i + 1), name }));

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private toPreview(r: Recipe): RecipePreview {
    return {
      id: r.id,
      title: r.title,
      image: r.image,
      category: r.category,
      cuisine: r.cuisine,
      tags: r.tags,
      diets: r.diets,
      readyInMinutes: r.readyInMinutes,
      servings: r.servings,
    };
  }

  searchByName(name: string): Observable<RecipePreview[]> {
    const term = name.toLowerCase().trim();
    const results = RECIPES.filter((r) => !term || r.title.toLowerCase().includes(term)).map((r) =>
      this.toPreview(r),
    );
    return of(results);
  }

  search(query: string): Observable<RecipePreview[]> {
    const terms = this.tokenize(query);
    if (terms.length === 0) return of(this.listAll());

    const results = RECIPES.map((recipe) => ({
      recipe,
      score: this.scoreRecipe(recipe, terms),
    }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || a.recipe.title.localeCompare(b.recipe.title))
      .map(({ recipe }) => this.toPreview(recipe));

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

  /** All recipes as previews, used by lists and the meal-planner picker. */
  listAll(): RecipePreview[] {
    return RECIPES.map((r) => this.toPreview(r));
  }

  /** Full recipes for a list of IDs, preserving input order. */
  findByIds(ids: string[]): Recipe[] {
    return ids.map((id) => RECIPES.find((r) => r.id === id)).filter((r): r is Recipe => !!r);
  }

  getByCategory(category: string): Observable<RecipePreview[]> {
    const term = category.toLowerCase().trim();
    const results = RECIPES.filter((r) => r.cuisine.toLowerCase() === term).map((r) =>
      this.toPreview(r),
    );
    return of(results);
  }

  /**
   * Free-text search for chat: scores recipes by matching query terms against
   * title, ingredients, cuisine, category and tags.
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

    // German user terms mapped to English cuisines/tags in the dataset.
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

  private tokenize(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^a-z0-9äöüß\s-]/gi, ' ')
      .split(/\s+/)
      .map((term) => term.trim())
      .filter((term) => term.length > 1);
  }

  private scoreRecipe(recipe: Recipe, terms: string[]): number {
    const searchable = {
      title: recipe.title.toLowerCase(),
      cuisine: recipe.cuisine.toLowerCase(),
      category: recipe.category.toLowerCase(),
      tags: recipe.tags.toLowerCase(),
      ingredients: recipe.ingredients.join(' ').toLowerCase(),
    };

    return terms.reduce((score, term) => {
      if (searchable.title.includes(term)) return score + 5;
      if (searchable.ingredients.includes(term)) return score + 4;
      if (searchable.cuisine.includes(term)) return score + 3;
      if (searchable.category.includes(term)) return score + 2;
      if (searchable.tags.includes(term)) return score + 1;
      return score;
    }, 0);
  }
}
