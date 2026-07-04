import {
  CheckCircle2,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Skeleton } from '@heroui/react/skeleton';
import { useEffect, useState } from 'react';
import SectionTitle from '../components/ui/SectionTitle.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { whatsappLink } from '../data/storeInfo.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { getRepairServices } from '../services/repairService.js';
import RepairServiceCard from '../components/repair/RepairServiceCard.jsx';

export default function Repair() {
  const { t } = useI18n();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getRepairServices();
        if (mounted) setServices(data);
      } catch (err) {
        if (mounted) setError(err.message || 'Chargement des services impossible.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const processSteps = ['contact', 'diagnostic', 'quote', 'repair', 'test', 'delivery'];
  const pricing = ['diagnostic', 'cleaning', 'battery', 'screen', 'upgrade', 'system'];
  const benefits = [
    ['fast', Sparkles],
    ['quality', PackageCheck],
    ['warranty', ShieldCheck],
    ['whatsapp', MessageCircle],
  ];
  const faqs = ['time', 'diagnosticPaid', 'macbook', 'iphone', 'warranty'];
  const repairMessage = t('repairWhatsAppMessage');
  return (
    <>
      <section className="container-shell py-10 md:py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('repairTag')}</p>
            <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-white md:text-3xl">{t('repairHero')}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">{t('repairHeroDesc')}</p>
          </div>
          <a
            href={whatsappLink(repairMessage)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500/90 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-green-500"
          >
            <MessageCircle className="h-5 w-5" /> Demander un diagnostic
          </a>
        </div>
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {['fastDiagBadge', 'qualifiedTechsBadge', 'serviceWarrantyBadge', 'deliveryPossibleBadge'].map((key) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" /> {t(key)}
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="container-shell py-16 md:py-20">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <SectionTitle title={t('repairServices')} description={t('repairServicesDesc')} />
        </div>
        <div className="mx-auto grid max-w-[1200px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading && Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <Skeleton className="h-[180px] rounded-none" />
              <div className="p-5">
                <Skeleton className="h-5 rounded-xl" />
                <Skeleton className="mt-3 h-14 rounded-xl" />
                <Skeleton className="mt-4 h-6 w-24 rounded-full" />
                <Skeleton className="mt-4 h-11 rounded-xl" />
              </div>
            </div>
          ))}
          {error && <p className="col-span-full rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
          {!loading && !services.length && (
            <div className="col-span-full"><EmptyState title="Aucun service disponible." description="Les services de réparation seront ajoutés prochainement." /></div>
          )}
          {!loading && services.map((service) => (
            <RepairServiceCard key={service.slug} service={service} repairMessage={repairMessage} />
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-gray-50 py-16 transition-colors dark:bg-gray-900">
        <div className="container-shell">
          <SectionTitle title={t('simpleProcess')} description={t('repairProcessDesc')} />
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {processSteps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <span className="text-4xl font-black text-gray-200 dark:text-gray-600">0{index + 1}</span>
                <h3 className="mt-4 font-black text-gray-900 dark:text-white">{t(`repairStep_${step}`)}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container-shell py-16">
        <SectionTitle title={t('indicativePrices')} description={t('priceDisclaimer')} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pricing.map((item) => (
            <div key={item} className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">{t(`repairPrice_${item}_title`)}</h3>
              <p className="mt-4 text-3xl font-black text-gray-700 dark:text-gray-300">{t(`repairPrice_${item}_value`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-950 py-16 text-white">
        <div className="container-shell grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">{t('repairBenefitsTag')}</p>
            <h2 className="text-3xl font-black md:text-4xl">{t('repairBenefitsTitle')}</h2>
            <p className="mt-4 leading-8 text-gray-400">{t('repairBenefitsDesc')}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map(([id, Icon]) => (
              <div key={id} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                <Icon className="h-7 w-7 text-gray-400" />
                <h3 className="mt-4 font-black">{t(`repairBenefit_${id}_title`)}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{t(`repairBenefit_${id}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-shell py-16">
        <SectionTitle title={t('repairFaqTitle')} />
        <div className="grid gap-4 lg:grid-cols-2">
          {faqs.map((faq) => (
            <details key={faq} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <summary className="cursor-pointer list-none text-base font-black text-gray-900 dark:text-white">
                {t(`repairFaq_${faq}_q`)}
              </summary>
              <p className="mt-4 leading-7 text-gray-500 dark:text-gray-400">{t(`repairFaq_${faq}_a`)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-shell pb-20">
        <div className="overflow-hidden rounded-[1.75rem] bg-gray-950 p-8 text-white shadow-sm md:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-3xl font-black md:text-4xl">{t('repairFinalCtaTitle')}</h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-400">{t('repairFinalCtaDesc')}</p>
            </div>
            <a
              href={whatsappLink(repairMessage)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500/90 px-8 py-4 text-base font-bold text-white transition-colors hover:bg-green-500 sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" /> {t('contactWhatsApp')}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
