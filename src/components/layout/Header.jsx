import { Menu, MessageCircle, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SearchBar from '../ui/SearchBar.jsx';
import LanguageSwitcher from '../ui/LanguageSwitcher.jsx';
import { phoneLink, storeInfo, whatsappLink } from '../../data/storeInfo.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import BrandLogo from '../ui/BrandLogo.jsx';

export default function Header({ onMenuOpen }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const submitSearch = () => {
    const query = searchQuery.trim();
    navigate(query ? `/shop?search=${encodeURIComponent(query)}` : '/shop');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-xl transition-colors duration-300 dark:border-gray-800 dark:bg-gray-950/95">
      <div className="container-shell flex min-w-0 items-center gap-3 py-3 lg:gap-4">
        <button
          className="rounded-xl border border-gray-200 p-2.5 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
          onClick={onMenuOpen}
          aria-label={t('openMenu')}
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="shrink-0">
          <BrandLogo size="md" subtitle={t('electronicsStore')} />
        </Link>

        <div className="hidden flex-1 lg:block max-w-xl mx-auto">
          <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={submitSearch} />
        </div>

        <div className="ms-auto flex min-w-0 items-center gap-2 md:gap-3">
          <a href={phoneLink()} className="hidden md:flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            <Phone className="h-4 w-4" /> {storeInfo.phone}
          </a>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-xl bg-green-500/90 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-500 xl:flex"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>

          <LanguageSwitcher />
        </div>
      </div>

      <div className="container-shell pb-3 lg:hidden">
        <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={submitSearch} />
      </div>
    </header>
  );
}
