import { MapPin, MessageCircle, Phone } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { storeInfo, whatsappLink } from '../data/storeInfo.js';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function Contact() {
  const { t } = useI18n();

  return (
    <section className="container-shell py-10 md:py-12">
      <Breadcrumb items={[{ label: t('contact') }]} />
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white md:text-3xl">{t('contactTitle')}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">{t('contactDesc')}</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <form className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <input className="input-base" placeholder={t('name')} />
            <input className="input-base" placeholder={t('phone')} />
          </div>
          <input className="input-base mt-4 w-full" placeholder={t('email')} />
          <textarea className="input-base mt-4 min-h-40 w-full resize-none" placeholder={t('message')} />
          <Button className="mt-4" type="button">{t('send')}</Button>
        </form>
        <aside className="space-y-5">
          <div className="rounded-3xl bg-gray-950 p-6 text-white shadow-sm dark:bg-gray-900">
            <h2 className="text-2xl font-black">{t('storeName')}</h2>
            <p className="mt-4 flex gap-3 text-gray-400">
              <MapPin className="h-5 w-5 shrink-0 mt-0.5 text-gray-500" /> {storeInfo.address}
            </p>
            <p className="mt-3 flex gap-3 text-gray-400">
              <Phone className="h-5 w-5 shrink-0 mt-0.5 text-gray-500" /> {storeInfo.phone}
            </p>
            <a
              href={whatsappLink('Bonjour MaiElectro, je veux vous contacter.')}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-500/90 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-green-500"
            >
              <MessageCircle className="h-4 w-4" /> Contacter sur WhatsApp
            </a>
          </div>
          <div className="grid min-h-56 place-items-center rounded-3xl bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <div>
              <MapPin className="mx-auto mb-3 h-10 w-10 text-gray-400" />
              <p className="font-semibold">{t('mapsPlaceholder')}</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
