import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import ProductFilters from '../components/product/ProductFilters.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { categoryMeta } from '../data/categories.js';
import { useProductData } from '../context/ProductDataContext.jsx';
import { applyProductFilters, getCategoryOptions } from './Shop.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { SPARE_PART_FILTERS, filterProductsForSparePartSubcategory, getSparePartCounts, getSparePartFilter } from '../utils/productClassification.js';

export default function CategoryPage() {
  const { t } = useI18n();
  const { getProductsByCategory } = useProductData();
  const { categoryId } = useParams();
  const [params, setSearchParams] = useSearchParams();
  const meta = categoryMeta[categoryId] || { name: 'Catégorie', description: 'Sélection MaiElectro.' };
  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    category: '',
    brand: params.get('brand') || '',
    maxPrice: 25000,
    sort: 'featured',
    stock: '',
  });
  const selectedSub = categoryId === 'pieces-detachees' ? (params.get('sub') || '') : '';
  const baseProducts = useMemo(() => getProductsByCategory(categoryId), [getProductsByCategory, categoryId]);
  const spareCounts = useMemo(() => getSparePartCounts(baseProducts), [baseProducts]);
  const filteredBySubcategory = useMemo(() => {
    if (categoryId !== 'pieces-detachees') return baseProducts;
    return filterProductsForSparePartSubcategory(baseProducts, selectedSub);
  }, [baseProducts, categoryId, selectedSub]);
  const filteredProducts = useMemo(() => applyProductFilters(filteredBySubcategory, filters), [filteredBySubcategory, filters]);
  const translatedCategoryOptions = useMemo(() => getCategoryOptions(t), [t]);
  const activeSubFilter = getSparePartFilter(selectedSub);

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      search: params.get('search') || '',
      brand: params.get('brand') || '',
    }));
  }, [params.toString()]);

  if (categoryId === 'reparation' || categoryId === 'repair') {
    return <Navigate to="/reparation" replace />;
  }

  const updateSub = (sub) => {
    const next = new URLSearchParams(params);
    if (sub) next.set('sub', sub);
    else next.delete('sub');
    setSearchParams(next, { replace: true });
  };

  const emptyStateBySub = {
    chargeurs: {
      title: 'Aucun chargeur disponible pour le moment.',
      description: 'Aucun chargeur compatible n’est listé pour cette sous-catégorie.',
    },
  };

  const emptyState = emptyStateBySub[selectedSub] || {
    title: 'Aucun produit trouvé dans cette sous-catégorie.',
    description: 'Essayez une autre sous-catégorie ou revenez à toutes les pièces.',
  };

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

      {categoryId === 'pieces-detachees' && (
        <div className="no-scrollbar mb-6 flex min-w-0 gap-2 overflow-x-auto pb-2">
          {SPARE_PART_FILTERS.map((filter) => {
            const isActive = selectedSub === filter.value || (!selectedSub && !filter.value);
            const count = filter.value ? ` (${spareCounts[filter.value] || 0})` : '';
            return (
              <button
                key={filter.value || 'all'}
                type="button"
                onClick={() => updateSub(filter.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label}{count}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid min-w-0 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <ProductFilters filters={filters} onChange={setFilters} categories={translatedCategoryOptions} />
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              {filteredProducts.length} {t('productsFoundIn')} {meta.name}
              {categoryId === 'pieces-detachees' && selectedSub ? ` · ${activeSubFilter.label}` : ''}
            </p>
          </div>
          {categoryId === 'pieces-detachees' && selectedSub && !filteredProducts.length ? (
            <EmptyState
              title={emptyState.title}
              description={emptyState.description}
              actionTo="/category/pieces-detachees"
              actionLabel="Toutes les pièces"
            />
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </div>
    </section>
  );
}
