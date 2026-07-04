import SectionTitle from '../ui/SectionTitle.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function BrandShowcase() {
  const { t } = useI18n();
  const brands = ['Lenovo', 'Dell', 'HP', 'MacBook', 'Samsung', 'Logitech'];

  return (
    <section className="bg-gray-50 py-16 transition-colors dark:bg-gray-900">
      <div className="container-shell">
        <SectionTitle eyebrow={t('ourBrands')} title={t('brandsTitle')} />
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((brand) => (
            <div
              key={brand}
              className="grid h-24 place-items-center rounded-2xl border border-gray-200 bg-white p-4 text-lg font-black text-gray-700 transition-all duration-300 hover:border-gray-400 hover:shadow-sm hover:scale-[1.02] cursor-pointer dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
