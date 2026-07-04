import { Phone } from 'lucide-react';
import { phoneLink, storeInfo } from '../../data/storeInfo.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function TopBar() {
  const { t } = useI18n();
  return (
    <div className="border-b border-gray-800 bg-gray-950 text-white">
      <div className="container-shell flex flex-col items-center justify-between gap-2 py-2 text-center text-xs font-medium text-gray-400 sm:flex-row">
        <p>{t('topBarPromo')}</p>
        <a
          href={phoneLink()}
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <Phone className="h-3.5 w-3.5" /> {storeInfo.phone}
        </a>
      </div>
    </div>
  );
}
