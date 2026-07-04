export const stockLabel = (stock) => (stock === 'out_of_stock' ? 'Rupture de stock' : 'En stock');

export default function StockToggleButton({ product, onToggle }) {
  const isInStock = product.stock !== 'out_of_stock';
  return (
    <button
      type="button"
      onClick={() => onToggle(product, isInStock ? 'out_of_stock' : 'in_stock')}
      className={`rounded-full px-3 py-2 text-xs font-black transition-colors ${isInStock ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300'}`}
    >
      {isInStock ? 'Marquer rupture' : 'Marquer en stock'}
    </button>
  );
}
