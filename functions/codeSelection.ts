// Pure selection-restoration helpers for code mode. The saved language/
// collection/snippet in localStorage are only *hints* — they must be validated
// against what the API actually returns before use, and fall back to the first
// entry when stale.

export function resolveInitialId<T, K extends keyof T>(
  items: T[],
  savedId: string | null,
  idKey: K,
): T[K] | null {
  if (items.length === 0) return null;
  if (savedId && items.some((item) => item[idKey] === savedId)) {
    return savedId as T[K];
  }
  return items[0][idKey];
}

export function resolveInitialSnippetIndex(
  count: number,
  saved: string | null,
): number {
  const parsed = saved === null ? NaN : parseInt(saved, 10);
  if (Number.isInteger(parsed) && parsed >= 0 && parsed < count) {
    return parsed;
  }
  return 0;
}
