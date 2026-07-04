import { useEffect, useMemo, useState } from 'react';
import { Button as HeroButton } from '@heroui/react/button';
import { Chip } from '@heroui/react/chip';
import { useSearchParams } from 'react-router-dom';
import ProductFilters from '../components/product/ProductFilters.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import SectionTitle from '../components/ui/SectionTitle.jsx';
import { useProductData } from '../context/ProductDataContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

export const categoryOptions = [
  { value: 'laptops', label: 'PC Portable' },
  { value: 'iphone', label: 'iPhone' },
  { value: 'accessoires', label: 'Accessoires' },
  { value: 'pieces-detachees', label: 'Pièces détachées' },
];

export const getCategoryOptions = (t) => [
  { value: 'laptops', label: t('navLaptops') },
  { value: 'iphone', label: t('navIphone') },
  { value: 'accessoires', label: t('navAccessoires') },
  { value: 'pieces-detachees', label: t('navPieces') },
];

export const applyProductFilters = (items, filters) => {
  const search = String(filters.search || '').trim().toLowerCase();
  return items
    .filter((product) => !filters.category || product.category === filters.category)
    .filter((product) => !filters.brand || product.brand === filters.brand)
    .filter((product) => !filters.stock || product.stock === filters.stock)
    .filter((product) => product.price <= filters.maxPrice)
    .filter((product) => {
      if (!search) return true;

      return [
        product.name,
        product.brand,
        product.category,
        product.subCategory,
        product.sub_category,
        product.product_type,
        product.type,
        product.tags,
        product.description,
        product.model,
      ].some((value) => String(value || '').toLowerCase().includes(search));
    })
    .sort((a, b) => {
      if (filters.sort === 'price-asc') return a.price - b.price;
      if (filters.sort === 'price-desc') return b.price - a.price;
      if (filters.sort === 'rating') return b.rating - a.rating;
      if (filters.sort === 'featured') return Number(b.featured) - Number(a.featured) || Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
      return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    });
};

export default function Shop() {
  const { t } = useI18n();
  const { products } = useProductData();
  const [params] = useSearchParams();
  const paramString = params.toString();
  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    category: params.get('category') || '',
    brand: params.get('brand') || '',
    maxPrice: 25000,
    sort: 'featured',
    stock: '',
  });

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      search: params.get('search') || '',
      category: params.get('category') || '',
      brand: params.get('brand') || '',
    }));
  }, [paramString]);

  const filteredProducts = useMemo(() => applyProductFilters(products, filters), [products, filters]);
  const translatedCategoryOptions = useMemo(() => getCategoryOptions(t), [t]);
  const activeSearch = filters.search.trim();

  return (
    <section className="container-shell py-10 md:py-12">
      <Breadcrumb items={[{ label: t('shop') }]} />
      <div className="mb-6">
        <SectionTitle title={t('shopTitle')} description={t('shopDesc')} />
      </div>
      <div className="no-scrollbar mb-6 flex min-w-0 gap-2 overflow-x-auto pb-2">
        <HeroButton type="button" radius="full" size="sm" color={!filters.category ? 'primary' : 'default'} variant={!filters.category ? 'solid' : 'flat'} onPress={() => setFilters((current) => ({ ...current, category: '' }))} className="shrink-0 px-4 text-sm font-black">
          {t('allCategories')}
        </HeroButton>
        {translatedCategoryOptions.map((category) => (
          <HeroButton key={category.value} type="button" radius="full" size="sm" color={filters.category === category.value ? 'primary' : 'default'} variant={filters.category === category.value ? 'solid' : 'flat'} onPress={() => setFilters((current) => ({ ...current, category: category.value }))} className="shrink-0 px-4 text-sm font-black">
            {category.label}
          </HeroButton>
        ))}
      </div>
      <div className="grid min-w-0 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <ProductFilters filters={filters} onChange={setFilters} categories={translatedCategoryOptions} />
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              {activeSearch && (
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Résultats pour "{activeSearch}"</h2>
              )}
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{filteredProducts.length} {t('productsFound')}</p>
            </div>
            <Chip color="warning" variant="flat" radius="full" className="font-black">{t('freeDelivery')} · {t('warranty6')}</Chip>
          </div>
          <ProductGrid
            products={filteredProducts}
            emptyTitle={activeSearch ? `Aucun produit trouvé pour "${activeSearch}"` : undefined}
            emptyDescription={activeSearch ? null : undefined}
          />
        </div>
      </div>
    </section>
  );
}
