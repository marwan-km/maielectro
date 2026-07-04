import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button.jsx';
import SafeImage from '../ui/SafeImage.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function RepairSection() {
  const { t } = useI18n();

  return (
    <section className="bg-gray-50 py-16 transition-colors dark:bg-gray-900">
      <div className="container-shell grid items-center gap-10 lg:grid-cols-2">
        <SafeImage
          src="/images/repair/system-install.jpg"
          alt={t('repairTeamTag')}
          className="aspect-[4/3] w-full rounded-[1.75rem] bg-gray-100 shadow-lg dark:bg-gray-800"
          imageClassName="object-cover"
          priority
        />
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">{t('repairTeamTag')}</p>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white md:text-4xl">{t('repairTeamTitle')}</h2>
          <p className="mt-5 leading-8 text-gray-500 dark:text-gray-400">{t('repairTeamDesc')}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[t('screen'), t('battery'), t('keyboard'), t('ssdRam')].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-gray-200 bg-white p-4 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-all hover:shadow-sm hover:-translate-y-0.5"
              >
                {item}
              </div>
            ))}
          </div>
          <Button to="/reparation" className="mt-7">
            {t('learnMore')} <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
