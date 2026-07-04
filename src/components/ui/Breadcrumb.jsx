import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function Breadcrumb({ items = [] }) {
  const { t } = useI18n();

  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
      <Link
        to="/"
        className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-white"
      >
        <Home className="h-4 w-4" /> {t('home')}
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            {isLast || !item.to ? (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
