import { describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { RecipeService } from './recipe';

describe('RecipeService', () => {
  const service = new RecipeService();

  it('returns recipes for an empty search', async () => {
    const results = await firstValueFrom(service.search(''));

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: expect.any(String),
        image: expect.any(String),
      }),
    );
  });

  it('scores ingredient matches in smart search', async () => {
    const results = await firstValueFrom(service.searchSmart('chicken rice'));

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((recipe) => recipe.title.toLowerCase().includes('chicken'))).toBe(true);
  });

  it('keeps meal planner recipe ids in input order', () => {
    const all = service.listAll().slice(0, 2);
    const recipes = service.findByIds([all[1].id, all[0].id]);

    expect(recipes.map((recipe) => recipe.id)).toEqual([all[1].id, all[0].id]);
  });
});
