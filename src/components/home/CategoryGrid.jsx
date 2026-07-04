import { Link } from 'react-router-dom';
import { categories } from '../../data/categories.js';
import SectionTitle from '../ui/SectionTitle.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function CategoryGrid() {
  const { t } = useI18n();

  return (
    <section className="container-shell py-16">
      <SectionTitle eyebrow={t('categories')} title={t('findQuickly')} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.slice(0, 5).map((category) => {
          const Icon = category.icon;
          return (
            <Link
              to={category.path}
              key={category.id}
              className="group relative overflow-hidden rounded-2xl bg-gray-900 p-6 text-white shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
            >
              <img
                src={category.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-15 transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent" />
              <div className="relative">
                <Icon className="mb-12 h-8 w-8 text-gray-400" />
                <h3 className="text-xl font-black">{t(category.nameKey)}</h3>
                <p className="mt-1 text-sm text-gray-400">{category.description?.slice(0, 60)}...</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
