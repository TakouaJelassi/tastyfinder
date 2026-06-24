import { describe, expect, it } from 'vitest';
import { cloneValue, parseStoredValue } from './demo-storage';

describe('demo-storage utils', () => {
  describe('cloneValue', () => {
    it('returns a deep copy that does not share references', () => {
      const original = { items: ['a', 'b'] };
      const copy = cloneValue(original);
      copy.items.push('c');
      expect(original.items).toEqual(['a', 'b']);
    });
  });

  describe('parseStoredValue', () => {
    it('returns a clone of the fallback when raw is null', () => {
      const fallback = ['x'];
      const result = parseStoredValue<string[]>(null, fallback);
      expect(result).toEqual(['x']);
      expect(result).not.toBe(fallback);
    });

    it('parses valid JSON', () => {
      const result = parseStoredValue<{ a: number }>('{"a":1}', { a: 0 });
      expect(result).toEqual({ a: 1 });
    });

    it('falls back on invalid JSON', () => {
      const result = parseStoredValue<string[]>('{not valid', ['fallback']);
      expect(result).toEqual(['fallback']);
    });
  });
});
