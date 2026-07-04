import { Search } from 'lucide-react';
import { Input } from '@heroui/react/input';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function SearchBar({ value, onChange, placeholder }) {
  const { t } = useI18n();
  return (
    <label className="relative block w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500 rtl:left-auto rtl:right-4" />
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
    </label>
  );
}
