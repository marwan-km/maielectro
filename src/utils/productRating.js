const PLACEHOLDER_RATING = 4.7;

function hashString(value) {
  let hash = 0;
  for (const char of String(value || '')) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1000;
  }
  return hash;
}

export function getStableProductRating(product) {
  const explicit = Number(product?.rating);
  if (Number.isFinite(explicit) && explicit >= 4 && explicit <= 5 && explicit !== PLACEHOLDER_RATING) {
    return Number(explicit.toFixed(1));
  }

  const seed = product?.id || product?.slug || product?.name || product?.model || '';
  const hash = hashString(seed);
  const rating = 4 + (hash / 999);
  return Number(Math.min(5, Math.max(4, rating)).toFixed(1));
}
