import { Clock, MapPin, Phone } from 'lucide-react';
import { storeInfo } from '../../data/storeInfo.js';
import Button from '../ui/Button.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function StoreInfo() {
  const { t } = useI18n();

  return (
    <section className="container-shell py-16">
      <div className="grid overflow-hidden rounded-2xl bg-gray-950 text-white shadow-sm lg:grid-cols-2">
        <div className="p-8 md:p-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">{t('ourStores')}</p>
          <h2 className="text-3xl font-black md:text-4xl">{t('storeName')}</h2>
          <div className="mt-8 space-y-4 text-gray-400">
            <p className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 mt-0.5 text-gray-500" /> {storeInfo.address}</p>
            <p className="flex gap-3"><Phone className="h-5 w-5 shrink-0 mt-0.5 text-gray-500" /> {storeInfo.phone}</p>
            <p className="flex gap-3"><Clock className="h-5 w-5 shrink-0 mt-0.5 text-gray-500" /> {storeInfo.hours}</p>
          </div>
          <Button to="/contact" variant="secondary" className="mt-8">{t('contact')}</Button>
        </div>
        <div className="grid min-h-72 place-items-center bg-gray-900 p-8 text-center text-gray-400">
          <div>
            <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-600" />
            <p className="text-xl font-black text-white">{t('mapsPlaceholder')}</p>
            <p className="mt-2 text-sm text-gray-500">{storeInfo.address}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
