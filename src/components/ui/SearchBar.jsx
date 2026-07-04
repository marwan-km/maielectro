import { Search } from 'lucide-react';
import { Input } from '@heroui/react/input';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function SearchBar({ value, onChange, onSubmit, placeholder }) {
  const { t } = useI18n();

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <form className="relative block w-full" onSubmit={handleSubmit}>
      <button
        type="submit"
        aria-label="Rechercher"
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition-colors hover:text-electric focus:outline-none focus-visible:text-electric dark:text-slate-500 rtl:left-auto rtl:right-4"
      >
        <Search className="h-5 w-5" />
      </button>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || t('searchPlaceholder')}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-electric focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-blue-900/30 rtl:pl-4 rtl:pr-12"
        classNames={{
          inputWrapper: 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
          input: 'text-slate-900 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-400',
        }}
      />
    </form>
  );
}
