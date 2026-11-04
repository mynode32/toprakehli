export const comparisonLimit = 3;

export function toggleComparison(ids, id, availableIds) {
  if (!availableIds.includes(id)) return ids;
  if (ids.includes(id)) return ids.filter(value => value !== id);
  return ids.length < comparisonLimit ? [...ids, id] : ids;
}
