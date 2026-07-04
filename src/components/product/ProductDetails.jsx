import { ChevronLeft, ChevronRight, MessageCircle, ShieldCheck, Star, Truck, X, ZoomIn } from 'lucide-react';
import { Card } from '@heroui/react/card';
import { useMemo, useState } from 'react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Breadcrumb from '../ui/Breadcrumb.jsx';
import ProductImage from '../ui/ProductImage.jsx';
import { whatsappLink } from '../../data/storeInfo.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ProductDetails({ product }) {
  const { t } = useI18n();
  const images = useMemo(() => {
    const unique = [...new Set([product.image, ...(product.gallery || [])].filter(Boolean))];
    return unique.length ? unique : [product.image];
  }, [product]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeImage = images[activeIndex] || product.image;
  const inStock = product.stock !== 'out_of_stock';
  const stockText = inStock ? 'En stock' : 'Rupture de stock';
  const keySpecs = [
    ['Processeur', product.processor],
    ['RAM', product.ram],
    ['Stockage', product.storage],
    ['Ecran', product.screenSize],
    ['Graphiques', product.graphics],
    ['Couleur', product.color],
    ['Modele', product.model],
    ['Annee', product.year],
  ].filter(([, value]) => value !== '' && value != null);
  const specs = product.specs?.length ? product.specs : keySpecs;

  const goToImage = (direction) => {
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  };

  return (
    <section className="container-shell py-10 md:py-12">
      <Breadcrumb items={[{ label: t('shop'), to: '/shop' }, { label: product.name }]} />
      <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <div className="space-y-4">
          <Card className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <ProductImage
              src={activeImage}
              alt={product.name}
              className="aspect-[4/3] min-h-[320px] md:min-h-[500px]"
              imageClassName="p-8 md:p-10 object-contain group-hover:scale-105"
              priority
            />
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute right-4 top-4 rounded-xl bg-white/90 p-2 text-gray-500 opacity-0 shadow-sm transition-opacity hover:text-gray-900 group-hover:opacity-100 dark:bg-gray-800/90 dark:text-gray-400"
              aria-label="Zoom"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goToImage(-1)}
                  className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl bg-white/95 text-gray-700 shadow-sm transition-all hover:bg-gray-900 hover:text-white dark:bg-gray-800/95 dark:text-gray-200"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => goToImage(1)}
                  className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl bg-white/95 text-gray-700 shadow-sm transition-all hover:bg-gray-900 hover:text-white dark:bg-gray-800/95 dark:text-gray-200"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </Card>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {images.map((item, index) => (
              <button
                key={`${item}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`overflow-hidden rounded-xl border bg-white transition-all dark:bg-gray-800 ${
                  index === activeIndex
                    ? 'border-gray-900 ring-2 ring-gray-200 dark:border-gray-300 dark:ring-gray-700'
                    : 'border-gray-200 hover:border-gray-400 dark:border-gray-700'
                }`}
              >
                <ProductImage src={item} alt="" className="h-24" imageClassName="p-2 object-contain" />
              </button>
            ))}
          </div>
        </div>

        <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-8">
          <Badge>{product.badge}</Badge>
          <h1 className="mt-4 text-3xl font-black text-gray-900 dark:text-white md:text-4xl leading-tight">
            {product.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
            <span className="flex items-center gap-1 text-amber-500">
              <Star className="h-5 w-5 fill-current" /> {product.rating}
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">{product.brand}</span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">{product.category}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              inStock
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {stockText}
            </span>
          </div>
          <p className="mt-6 max-h-52 overflow-y-auto pr-2 text-base leading-8 text-gray-600 dark:text-gray-400">
            {product.shortDescription || product.description}
          </p>

          {/* Price */}
          <div className="mt-6 flex items-end gap-3">
            <span className="text-4xl font-black text-gray-900 dark:text-white">{product.price.toLocaleString()} DH</span>
            {product.oldPrice ? (
              <span className="text-lg font-semibold text-gray-400 line-through">{product.oldPrice.toLocaleString()} DH</span>
            ) : null}
          </div>

          {/* Info cards */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
              <ShieldCheck className="mb-2 h-5 w-5 text-gray-400" /> {t('warrantyLabel')} {product.warranty}
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
              <Truck className="mb-2 h-5 w-5 text-gray-400" /> {product.freeDelivery ? t('freeDelivery') : 'Livraison disponible'}
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
              <ShieldCheck className="mb-2 h-5 w-5 text-green-500" /> {stockText}
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-7">
            <a
              href={whatsappLink(`Bonjour, je suis intéressé par ce produit: ${product.name}`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500/90 px-8 py-4 text-base font-bold text-white shadow-sm transition-colors duration-200 hover:bg-green-500"
            >
              <MessageCircle className="h-5 w-5" /> Commander sur WhatsApp
            </a>
          </div>

          {/* Specs table */}
          <Card className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900">
            <h2 className="border-b border-gray-200 px-5 py-4 text-base font-black text-slate-950">{t('specs')}</h2>
            <table className="w-full text-sm">
              <tbody>
                {specs.map(([key, value]) => (
                  <tr key={key} className="border-b border-gray-200 last:border-0">
                    <th className="w-1/3 bg-gray-50 px-5 py-3 text-left font-semibold text-slate-800">{key}</th>
                    <td className="px-5 py-3 text-gray-700">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </Card>
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-gray-950/90 p-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-100"
            aria-label={t('close')}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={activeImage}
            alt={product.name}
            className="max-h-[86vh] max-w-[92vw] rounded-3xl bg-white object-contain p-6 shadow-xl dark:bg-gray-800"
          />
        </div>
      )}
    </section>
  );
}
