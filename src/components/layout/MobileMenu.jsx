import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/categories.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import LanguageSwitcher from '../ui/LanguageSwitcher.jsx';
import BrandLogo from '../ui/BrandLogo.jsx';

export default function MobileMenu({ isOpen, onClose }) {
  const { t } = useI18n();
  const [openGroups, setOpenGroups] = useState({ laptops: true, 'pieces-detachees': true });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={onClose} aria-label={t('closeMenu')} />
      <aside className="relative h-full w-80 max-w-[86vw] overflow-y-auto bg-slate-950 p-6 text-slate-100 shadow-2xl animate-slide-in-right transition-colors">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <BrandLogo size="sm" tone="dark" />
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            aria-label={t('close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-900 p-3">
          <LanguageSwitcher />
        </div>

        {/* Navigation */}
        <div className="space-y-1">
          <Link
            to="/shop"
            onClick={onClose}
            className="block rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-slate-200"
          >
            {t('shop')}
          </Link>

          {categories.map((category) => (
            <div key={category.id}>
              <div className="flex items-center gap-2">
                <Link
                  to={category.path}
                  onClick={onClose}
                  className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  {t(category.nameKey)}
                </Link>
                {category.children.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setOpenGroups((current) => ({ ...current, [category.id]: !current[category.id] }))}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                    aria-label={category.name}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${openGroups[category.id] ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
              {category.children.length > 0 && (
                <div className={`${openGroups[category.id] ? 'block' : 'hidden'} ms-4 border-s-2 border-slate-700 ps-3`}>
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      to={child.path}
                      onClick={onClose}
                      className="block rounded-xl px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link
            to="/reparation"
            onClick={onClose}
            className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
          >
            {t('repair')}
          </Link>
          <Link
            to="/contact"
            onClick={onClose}
            className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
          >
            {t('contact')}
          </Link>
        </div>
      </aside>
    </div>
  );
}
