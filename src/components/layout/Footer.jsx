import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/categories.js';
import { storeInfo, whatsappLink } from '../../data/storeInfo.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import BrandLogo from '../ui/BrandLogo.jsx';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-gray-200 bg-gray-950 text-white transition-colors duration-300 dark:border-gray-800">
      <div className="container-shell grid gap-10 py-14 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        {/* Brand */}
        <div>
          <BrandLogo size="md" tone="dark" className="mb-5" />
          <p className="max-w-sm text-sm leading-7 text-gray-400">{t('footerDesc')}</p>
          <a
            href={whatsappLink('Bonjour MaiElectro')}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-2.5 text-sm font-semibold text-green-400 transition-colors hover:bg-green-500/20"
          >
            <MessageCircle className="h-4 w-4" /> Contacter sur WhatsApp
          </a>
        </div>

        {/* Service */}
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">{t('service')}</h3>
          <div className="space-y-3 text-sm text-gray-500">
            <Link to="/reparation" className="block hover:text-white transition-colors">{t('repair')}</Link>
            <Link to="/shop" className="block hover:text-white transition-colors">{t('shop')}</Link>
            <Link to="/contact" className="block hover:text-white transition-colors">{t('contact')}</Link>
            <Link to="/about" className="block hover:text-white transition-colors">{t('about')}</Link>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">{t('categories')}</h3>
          <div className="space-y-3 text-sm text-gray-500">
            {categories.slice(0, 5).map((category) => (
              <Link key={category.id} to={category.path} className="block hover:text-white transition-colors">
                {t(category.nameKey)}
              </Link>
            ))}
          </div>
        </div>

        {/* Store info */}
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">{t('ourStores')}</h3>
          <div className="space-y-3 text-sm text-gray-500">
            <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" /> {storeInfo.address}</p>
            <p className="flex gap-2"><Phone className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" /> {storeInfo.phone}</p>
            <p className="flex gap-2"><Mail className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" /> {storeInfo.email}</p>
          </div>
          <div className="mt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">{t('subscribeNewsletter')}</p>
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-gray-500 transition-colors"
                placeholder={t('email')}
              />
              <button className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-100">
                {t('send')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-5">
        <div className="container-shell flex flex-col justify-between gap-2 text-xs text-gray-600 md:flex-row">
          <p>{t('copyright')}</p>
          <p>{t('footerLinks')}</p>
        </div>
      </div>
    </footer>
  );
}
