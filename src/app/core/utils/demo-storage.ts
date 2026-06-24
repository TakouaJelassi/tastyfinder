/**
 * Reine Hilfsfunktionen für die Demo-Modus-Persistenz (localStorage).
 * Bewusst frei von Angular-DI, damit sie isoliert testbar sind.
 */

/** Tiefe Kopie über JSON — schützt die Seed-Daten vor Mutationen. */
export function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Parst einen gespeicherten Rohwert. Bei fehlendem oder ungültigem JSON
 * wird eine Kopie des Fallbacks zurückgegeben (nie der Original-Seed).
 */
export function parseStoredValue<T>(raw: string | null, fallback: T): T {
  if (!raw) return cloneValue(fallback);
  try {
    return JSON.parse(raw) as T;
  } catch {
    return cloneValue(fallback);
  }
}
