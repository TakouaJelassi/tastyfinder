/**
 * Pure helpers for demo-mode persistence (localStorage).
 * Intentionally free of Angular DI so they can be tested in isolation.
 */

/** Deep copy via JSON — protects seed data from mutations. */
export function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Parses a stored raw value. Returns a copy of the fallback when the value
 * is missing or contains invalid JSON — never the original seed object.
 */
export function parseStoredValue<T>(raw: string | null, fallback: T): T {
  if (!raw) return cloneValue(fallback);
  try {
    return JSON.parse(raw) as T;
  } catch {
    return cloneValue(fallback);
  }
}
