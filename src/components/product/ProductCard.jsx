import { memo } from 'react';
import { CheckCircle, Eye, MessageCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@heroui/react/card';
import FallbackImage from '../ui/FallbackImage.jsx';
import { whatsappLink } from '../../data/storeInfo.js';

function ProductCard({ product }) {
  const inStock = product.stock !== 'out_of_stock';
  const stockText = inStock ? 'En stock' : 'Rupture de stock';

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <Link to={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.name} />

      <div className="relative">
        <FallbackImage
          src={product.image}
          alt={product.name}
          className="aspect-[4/3] border-b border-gray-100 dark:border-gray-700"
          imageClassName="p-6 sm:p-7 object-contain transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <div className="absolute left-4 top-4">
            <span className="inline-flex rounded-full bg-gray-900 px-2.5 py-1 text-xs font-bold text-white dark:bg-gray-100 dark:text-gray-900">
              {product.badge}
            </span>
          </div>
        )}
        {product.oldPrice && (
          <div className="absolute right-4 top-4">
            <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800 dark:bg-green-900/30 dark:text-green-300">
              -{Math.round((1 - product.price / product.oldPrice) * 100)}%
            </span>
          </div>
        )}
        <div className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-gray-600 opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100 dark:bg-gray-800/95 dark:text-gray-300">
          <Eye className="h-4 w-4" />
        </div>
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {product.brand}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <Star className="h-3.5 w-3.5 fill-current text-amber-400" /> {product.rating}
          </span>
        </div>

        <h3 className="line-clamp-2 min-h-[3.4rem] text-[16px] font-black leading-snug text-gray-900 dark:text-white">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-gray-400 dark:text-gray-500">
          {product.shortDescription || [product.processor, product.ram, product.storage].filter(Boolean).join(' · ') || product.description}
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <span className="text-2xl font-black text-gray-900 dark:text-white">{product.price.toLocaleString()} DH</span>
          {product.oldPrice ? (
            <span className="text-sm font-semibold text-gray-400 line-through">{product.oldPrice.toLocaleString()} DH</span>
          ) : null}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1 text-gray-400">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" /> {product.warranty}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            inStock
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {stockText}
          </span>
        </div>

        <div className="relative z-20 mt-5">
          <a
            href={whatsappLink(`Bonjour, je suis intéressé par ce produit: ${product.name}`)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-500/90 px-4 text-sm font-bold text-white transition-colors duration-200 hover:bg-green-500"
            onClick={(event) => event.stopPropagation()}
          >
            <MessageCircle className="h-4 w-4" /> Commander sur WhatsApp
          </a>
        </div>
      </div>
    </Card>
  );
}

export default memo(ProductCard);
