import { describe, expect, it } from 'vitest';
import { uniqueNewShoppingNames } from './shopping-items';

describe('uniqueNewShoppingNames', () => {
  it('skips duplicate shopping names case-insensitively', () => {
    const names = uniqueNewShoppingNames(['Tomatoes', 'Rice'], [' tomatoes ', 'Basil', 'rice']);

    expect(names).toEqual(['Basil']);
  });

  it('deduplicates incoming names and ignores empty values', () => {
    const names = uniqueNewShoppingNames([], ['Milk', ' ', 'milk', 'Bread']);

    expect(names).toEqual(['Milk', 'Bread']);
  });
});
