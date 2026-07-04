import { ArrowRight, Headphones, MessageCircle, Monitor, ShieldCheck, Truck } from 'lucide-react';
import { Card } from '@heroui/react/card';
import Button from '../ui/Button.jsx';
import { whatsappLink } from '../../data/storeInfo.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-gray-950 text-white">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.04),transparent_60%)]" />
      <div className="container-shell relative grid min-h-[540px] items-center gap-10 py-14 lg:grid-cols-[1fr_0.92fr]">
        <div className="animate-fade-in">
          <span className="mb-5 inline-block rounded-full border border-gray-700 bg-gray-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gray-300">
            {t('heroTag')}
          </span>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-400">
            {t('heroSubtitle')}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/shop">
              {t('viewProducts')} <ArrowRight className="h-5 w-5" />
            </Button>
            <a
              href={whatsappLink('Bonjour MaiElectro, je veux commander un PC portable.')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-6 py-3 text-sm font-bold text-gray-200 transition-colors hover:bg-gray-800"
            >
              <MessageCircle className="h-5 w-5 text-green-400" /> {t('orderWhatsApp')}
            </a>
          </div>
          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [t('warranty6'), ShieldCheck],
              [t('freeDelivery'), Truck],
              [t('freeAdobe'), Monitor],
              [t('whatsappSupport'), Headphones],
            ].map(([label, Icon]) => (
              <Card
                key={label}
                className="rounded-2xl border border-gray-800 bg-gray-900 p-4 text-sm font-semibold text-gray-300 transition-all duration-300 hover:border-gray-700 hover:bg-gray-800"
              >
                <Icon className="mb-3 h-5 w-5 text-gray-500" /> {label}
              </Card>
            ))}
          </div>
        </div>
        <div className="relative animate-slide-up">
          <img
            src="/images/hero/hero-electronics.jpg"
            alt="Laptop premium MaiElectro"
            className="relative aspect-[4/3] w-full rounded-[1.75rem] object-cover shadow-2xl shadow-black/60"
          />
          <Card className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-gray-100 bg-white p-5 text-gray-900 shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('heroStoreCardTitle')}</p>
            <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('heroStoreCardDesc')}</p>
          </Card>
        </div>
      </div>
    </section>
  );
}
