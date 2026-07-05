import { memo } from 'react';
import { CheckCircle, Eye, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@heroui/react/card';
import FallbackImage from '../ui/FallbackImage.jsx';
import { useCart } from '../../context/CartContext.jsx';

function ProductCard({ product }) {
  const { addToCart, getItemQuantity } = useCart();
  const inStock = product.stock !== 'out_of_stock';
  const stockText = inStock ? 'En stock' : 'Rupture de stock';
  const cartQuantity = getItemQuantity(product.id);

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <Link to={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.name} />

      <div className="relative">
        <FallbackImage
          src={product.image}
          alt={product.name}
          className="aspect-[4/3] border-b border-gray-100 dark:border-gray-700"
          imageClassName="p-3 sm:p-6 object-contain transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
            <span className="inline-flex rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-bold text-white dark:bg-gray-100 dark:text-gray-900">
              {product.badge}
            </span>
          </div>
        )}
        {product.oldPrice && (
          <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
            <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-800 dark:bg-green-900/30 dark:text-green-300">
              -{Math.round((1 - product.price / product.oldPrice) * 100)}%
            </span>
          </div>
        )}
        <div className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-gray-600 opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100 dark:bg-gray-800/95 dark:text-gray-300">
          <Eye className="h-4 w-4" />
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {product.brand}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
            <Star className="h-3.5 w-3.5 fill-current text-amber-400" /> {Number(product.rating).toFixed(1)}
          </span>
        </div>

        <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-black leading-snug text-gray-900 dark:text-white sm:text-[16px]">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-[2.25rem] text-xs leading-5 text-gray-400 dark:text-gray-500 sm:text-sm">
          {product.shortDescription || [product.processor, product.ram, product.storage].filter(Boolean).join(' · ') || product.description}
        </p>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <span className="text-lg font-black text-gray-900 dark:text-white sm:text-2xl">{product.price.toLocaleString()} DH</span>
          {product.oldPrice ? (
            <span className="text-xs font-semibold text-gray-400 line-through sm:text-sm">{product.oldPrice.toLocaleString()} DH</span>
          ) : null}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1 text-gray-400">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" /> {product.warranty}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            inStock
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {stockText}
          </span>
        </div>

        <div className="relative z-20 mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              addToCart(product);
            }}
            className="inline-flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-gray-700 sm:w-auto dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
            aria-label="Ajouter au panier"
            title={cartQuantity > 0 ? `Déjà ajouté (${cartQuantity})` : 'Ajouter au panier'}
          >
            <ShoppingCart className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Ajouter</span>
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              addToCart(product);
            }}
            className="relative hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white transition-colors duration-200 hover:bg-green-600 sm:inline-flex"
            aria-label="Ajouter au panier"
            title={cartQuantity > 0 ? `Déjà ajouté (${cartQuantity})` : 'Ajouter au panier'}
          >
            <ShoppingCart className="h-5 w-5 shrink-0" />
            {cartQuantity > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gray-900 px-1 text-[10px] font-black leading-none text-white">
                {cartQuantity}
              </span>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}

export default memo(ProductCard);
