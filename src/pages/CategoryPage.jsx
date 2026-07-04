import { useMemo, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import ProductFilters from '../components/product/ProductFilters.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { categoryMeta } from '../data/categories.js';
import { useProductData } from '../context/ProductDataContext.jsx';
import { applyProductFilters, getCategoryOptions } from './Shop.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function CategoryPage() {
  const { t } = useI18n();
  const { getProductsByCategory } = useProductData();
  const { categoryId } = useParams();
  const [params] = useSearchParams();
  const meta = categoryMeta[categoryId] || { name: 'Catégorie', description: 'Sélection MaiElectro.' };
  const baseProducts = useMemo(() => getProductsByCategory(categoryId), [getProductsByCategory, categoryId]);
  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    category: '',
    brand: params.get('brand') || '',
    maxPrice: 25000,
    sort: 'featured',
    stock: '',
  });

  const filteredProducts = useMemo(() => applyProductFilters(baseProducts, filters), [baseProducts, filters]);
  const translatedCategoryOptions = useMemo(() => getCategoryOptions(t), [t]);

  if (categoryId === 'reparation' || categoryId === 'repair') {
    return <Navigate to="/reparation" replace />;
  }

  return (
    <section className="container-shell py-10 md:py-12">
      <Breadcrumb items={[{ label: t('shop'), to: '/shop' }, { label: meta.name }]} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white md:text-3xl">{meta.name}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">{meta.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {filteredProducts.length} {t('productsFound')}
        </span>
      </div>
      <div className="grid min-w-0 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <ProductFilters filters={filters} onChange={setFilters} categories={translatedCategoryOptions} />
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              {filteredProducts.length} {t('productsFoundIn')} {meta.name}
            </p>
          </div>
          <ProductGrid products={filteredProducts} />
        </div>
      </div>
    </section>
  );
}
