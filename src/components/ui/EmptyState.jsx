import { SearchX } from 'lucide-react';
import Button from './Button.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import AppCard from './AppCard.jsx';

export default function EmptyState({ title, description, actionTo, actionLabel }) {
  const { t } = useI18n();

  return (
    <AppCard className="border-dashed p-10 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500">
        <SearchX className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-xl font-black text-gray-900 dark:text-white">{title || t('noProducts')}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {actionTo && <Button to={actionTo} className="mt-6">{actionLabel || t('backToShop')}</Button>}
    </AppCard>
  );
}
