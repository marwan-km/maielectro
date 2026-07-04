import { ChevronLeft, ChevronRight, MessageCircle, ShoppingCart, ShieldCheck, Star, Truck, X, ZoomIn } from 'lucide-react';
import { Card } from '@heroui/react/card';
import { useMemo, useState } from 'react';
import Badge from '../ui/Badge.jsx';
import Breadcrumb from '../ui/Breadcrumb.jsx';
import ProductImage from '../ui/ProductImage.jsx';
import { whatsappLink } from '../../data/storeInfo.js';
import { useCart } from '../../context/CartContext.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ProductDetails({ product }) {
  const { t } = useI18n();
  const { addToCart, getItemQuantity } = useCart();
  const images = useMemo(() => {
    const unique = [...new Set([product.image, ...(product.gallery || [])].filter(Boolean))];
    return unique.length ? unique : [product.image];
  }, [product]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeImage = images[activeIndex] || product.image;
  const inStock = product.stock !== 'out_of_stock';
  const stockText = inStock ? 'En stock' : 'Rupture de stock';
  const cartQuantity = getItemQuantity(product.id);
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
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 md:py-12">
      <Breadcrumb items={[{ label: t('shop'), to: '/shop' }, { label: product.name }]} />
      <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="w-full space-y-4 lg:max-w-2xl">
          <Card className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <ProductImage
              src={activeImage}
              alt={product.name}
              className="aspect-[4/3] min-h-[240px] sm:min-h-[360px] md:min-h-[500px]"
              imageClassName="p-5 sm:p-8 md:p-10 object-contain group-hover:scale-105"
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
                <ProductImage src={item} alt="" className="h-20 sm:h-24" imageClassName="p-2 object-contain" />
              </button>
            ))}
          </div>
        </div>

        <div className="w-full lg:max-w-3xl lg:justify-self-end">
          <Card className="w-full rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6 md:p-8">
            <div className="flex justify-center lg:justify-start">
              <Badge>{product.badge}</Badge>
            </div>
            <h1 className="mt-4 text-center text-2xl font-black leading-tight text-gray-900 dark:text-white lg:text-left sm:text-3xl md:text-4xl">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold lg:justify-start">
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="h-5 w-5 fill-current" /> {Number(product.rating).toFixed(1)}
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
            <p className="mt-6 max-h-none overflow-visible pr-0 text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base lg:text-left">
              {product.shortDescription || product.description}
            </p>

            <div className="mt-6 flex flex-wrap items-end justify-center gap-3 lg:justify-start">
              <span className="text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">{product.price.toLocaleString()} DH</span>
              {product.oldPrice ? (
                <span className="text-base font-semibold text-gray-400 line-through sm:text-lg">{product.oldPrice.toLocaleString()} DH</span>
              ) : null}
            </div>

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

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => addToCart(product)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-4 text-base font-bold text-white shadow-sm transition-colors duration-200 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>{cartQuantity > 0 ? `Ajouter (${cartQuantity})` : 'Ajouter au panier'}</span>
              </button>
              <a
                href={whatsappLink(`Bonjour, je suis intéressé par ce produit: ${product.name}`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500/90 px-8 py-4 text-base font-bold text-white shadow-sm transition-colors duration-200 hover:bg-green-500"
              >
                <MessageCircle className="h-5 w-5" /> Commander sur WhatsApp
              </a>
            </div>

            <Card className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900/40">
              <h2 className="border-b border-gray-200 px-4 py-4 text-base font-black text-slate-950 dark:border-gray-700 dark:text-white">{t('specs')}</h2>
              <table className="w-full table-fixed text-sm">
                <tbody>
                  {specs.map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-200 last:border-0 dark:border-gray-700">
                      <th className="w-1/3 break-words bg-gray-900 px-4 py-3 text-left align-top font-semibold text-white">{key}</th>
                      <td className="break-words bg-white px-4 py-3 text-gray-800 dark:text-gray-800">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </Card>
        </div>
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
