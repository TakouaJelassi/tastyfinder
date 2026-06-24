import { describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { RecipeService } from './recipe';

describe('RecipeService', () => {
  const service = new RecipeService();

  describe('searchByName', () => {
    it('returns all recipes for an empty term', async () => {
      const all = service.listAll();
      const results = await firstValueFrom(service.searchByName(''));
      expect(results.length).toBe(all.length);
    });

    it('filters by title (case-insensitive)', async () => {
      const results = await firstValueFrom(service.searchByName('PIZZA'));
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.title.toLowerCase().includes('pizza'))).toBe(true);
    });

    it('returns an empty list when nothing matches', async () => {
      const results = await firstValueFrom(service.searchByName('xyznotarecipe'));
      expect(results).toEqual([]);
    });
  });

  describe('searchByIngredient', () => {
    it('finds recipes that contain the ingredient', async () => {
      const results = await firstValueFrom(service.searchByIngredient('garlic'));
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('getByCategory', () => {
    it('matches recipes by cuisine', async () => {
      const results = await firstValueFrom(service.getByCategory('italian'));
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns empty for an unknown cuisine', async () => {
      const results = await firstValueFrom(service.getByCategory('atlantean'));
      expect(results).toEqual([]);
    });
  });

  describe('getById', () => {
    it('returns the recipe for a known id', async () => {
      const recipe = await firstValueFrom(service.getById('1'));
      expect(recipe).not.toBeNull();
      expect(recipe?.id).toBe('1');
    });

    it('returns null for an unknown id', async () => {
      const recipe = await firstValueFrom(service.getById('does-not-exist'));
      expect(recipe).toBeNull();
    });
  });

  describe('searchSmart', () => {
    it('scores ingredient matches', async () => {
      const results = await firstValueFrom(service.searchSmart('chicken rice'));
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.title.toLowerCase().includes('chicken'))).toBe(true);
    });

    it('maps German cuisine synonyms (italienisch → italian)', async () => {
      const results = await firstValueFrom(service.searchSmart('italienisch'));
      expect(results.length).toBeGreaterThan(0);
    });

    it('maps the vegetarisch synonym to the vegetarian tag', async () => {
      const results = await firstValueFrom(service.searchSmart('vegetarisch'));
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns nothing when the query is only stopwords', async () => {
      const results = await firstValueFrom(service.searchSmart('ich habe und was'));
      expect(results).toEqual([]);
    });
  });

  describe('findByIds', () => {
    it('keeps the input order', () => {
      const all = service.listAll().slice(0, 2);
      const recipes = service.findByIds([all[1].id, all[0].id]);
      expect(recipes.map((r) => r.id)).toEqual([all[1].id, all[0].id]);
    });

    it('skips unknown ids', () => {
      const recipes = service.findByIds(['1', 'unknown']);
      expect(recipes.map((r) => r.id)).toEqual(['1']);
    });
  });
});
