/**
 * Centralized search utilities for fuzzy matching across the portfolio.
 */

export const removeAccents = (str: string): string => {
  return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
};

const levenshtein = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator,
      );
    }
  }
  return matrix[b.length][a.length];
};

/**
 * Fuzzy match an item against a search query.
 * Serializes the item to JSON and checks for substring or Levenshtein matches.
 */
export function searchMatch(item: any, query: string): boolean {
  if (!query) return true;
  const q = removeAccents(query.toLowerCase());
  const str = removeAccents(JSON.stringify(item).toLowerCase());

  if (str.includes(q)) return true;

  const queryWords = q.split(/\s+/).filter((w) => w.length > 2);
  if (queryWords.length === 0) return false;

  const strWords: string[] = str.match(/[a-z0-9]+/g) || [];

  return queryWords.every((qw) => {
    const maxDist = qw.length <= 4 ? 1 : 2;
    return strWords.some((sw) => {
      if (Math.abs(sw.length - qw.length) > maxDist) return false;
      if (sw === qw || sw.includes(qw)) return true;
      return levenshtein(qw, sw) <= maxDist;
    });
  });
}
