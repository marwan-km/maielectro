import StoreInfo from '../components/home/StoreInfo.jsx';
import SectionTitle from '../components/ui/SectionTitle.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function About() {
  const { t } = useI18n();

  return (
    <>
      <section className="container-shell py-16">
        <SectionTitle eyebrow={t('about')} title={t('aboutTitle')} description={t('aboutDesc')} />
        <div className="grid gap-5 md:grid-cols-3">
          {[t('productAdvice'), t('reliableRepair'), t('shopWarranty')].map((item) => (
            <div key={item} className="rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 p-8 text-xl font-black text-navy dark:text-white shadow-soft transition-all hover:shadow-premium hover:-translate-y-1">
              {item}
            </div>
          ))}
        </div>
      </section>
      <StoreInfo />
    </>
  );
}
