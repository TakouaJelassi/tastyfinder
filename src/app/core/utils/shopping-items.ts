export function uniqueNewShoppingNames(existingNames: string[], incomingNames: string[]): string[] {
  const seen = new Set(existingNames.map((name) => normalizeShoppingName(name)));
  const unique: string[] = [];

  for (const name of incomingNames) {
    const clean = name.trim();
    const normalized = normalizeShoppingName(clean);
    if (!clean || seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(clean);
  }

  return unique;
}

function normalizeShoppingName(name: string): string {
  return name.toLowerCase().trim();
}
