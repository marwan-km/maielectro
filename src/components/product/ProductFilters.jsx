import { Filter, RotateCcw, X } from 'lucide-react';
import { Button as HeroButton } from '@heroui/react/button';
import { Card } from '@heroui/react/card';
import { Switch } from '@heroui/react/switch';
import { memo, useCallback, useMemo, useState } from 'react';
import SearchBar from '../ui/SearchBar.jsx';
import { brands } from '../../data/categories.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

const selectClass = 'h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-slate-100 outline-none transition-colors [color-scheme:dark] placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500';

function ProductFilters({ filters, onChange, categories }) {
  const update = useCallback((key, value) => onChange({ ...filters, [key]: value }), [filters, onChange]);
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filterContent = useMemo(() => (
    <div className="min-w-0 space-y-5">
      <SearchBar value={filters.search} onChange={(value) => update('search', value)} />
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-200">{t('category')}</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => update('category', '')}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              !filters.category
                ? 'bg-white text-slate-950'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {t('allCategories')}
          </button>
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => update('category', category.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                filters.category === category.value
                  ? 'bg-white text-slate-950'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-200">{t('brand')}</span>
        <select value={filters.brand} onChange={(event) => update('brand', event.target.value)} className={selectClass}>
          <option value="">{t('allBrands')}</option>
          {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-200">
          {t('maxPrice')}: {filters.maxPrice.toLocaleString()} DH
        </span>
        <input type="range" min="100" max="25000" step="100" value={filters.maxPrice} onChange={(event) => update('maxPrice', Number(event.target.value))} className="w-full accent-slate-100" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-200">{t('sort')}</span>
        <select value={filters.sort} onChange={(event) => update('sort', event.target.value)} className={selectClass}>
          <option value="featured">{t('sortFeatured')}</option>
          <option value="price-asc">{t('sortPriceAsc')}</option>
          <option value="price-desc">{t('sortPriceDesc')}</option>
          <option value="rating">{t('sortRating')}</option>
        </select>
      </label>
      <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100">
        En stock uniquement
        <Switch
          isSelected={filters.stock === 'in_stock'}
          onValueChange={(checked) => update('stock', checked ? 'in_stock' : '')}
          size="sm"
          aria-label="En stock uniquement"
        />
      </label>
      <button
        type="button"
        onClick={() => onChange({ search: '', category: '', brand: '', maxPrice: 25000, sort: 'featured', stock: '' })}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-800 hover:text-white"
      >
        <RotateCcw className="h-4 w-4" /> {t('resetFilters')}
      </button>
    </div>
  ), [categories, filters.brand, filters.category, filters.maxPrice, filters.search, filters.sort, filters.stock, onChange, t, update]);

  return (
    <>
      {/* Mobile filter button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-sm font-semibold text-slate-100 shadow-sm lg:hidden"
      >
        <Filter className="h-4 w-4" /> {t('mobileFilters')}
      </button>

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <Card className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border border-slate-700 bg-slate-950 p-5 text-slate-100 shadow-2xl animate-slide-up sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-white">{t('filters')}</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                aria-label="Fermer les filtres"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterContent}
          </Card>
        </div>
      )}

      {/* Desktop sidebar */}
      <Card className="hidden min-w-0 rounded-2xl border border-slate-700 bg-slate-950 p-5 text-slate-100 shadow-sm transition-colors lg:sticky lg:top-32 lg:block">
        <h2 className="mb-5 text-base font-black text-white">{t('filters')}</h2>
        {filterContent}
      </Card>
    </>
  );
}

export default memo(ProductFilters);
