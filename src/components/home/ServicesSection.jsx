import { Cpu, ShieldCheck, Truck, Wrench } from 'lucide-react';
import { Card } from '@heroui/react/card';
import SectionTitle from '../ui/SectionTitle.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ServicesSection() {
  const { t } = useI18n();
  const services = [
    [t('saleControl'), t('saleControlDesc'), ShieldCheck],
    [t('fastRepair'), t('fastRepairDesc'), Wrench],
    [t('upgradePerf'), t('upgradePerfDesc'), Cpu],
    [t('delivery'), t('deliveryDesc'), Truck],
  ];

  return (
    <section className="container-shell py-16">
      <SectionTitle eyebrow={t('services')} title={t('servicesTitle')} description={t('servicesDesc')} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {services.map(([title, text, Icon]) => (
          <Card
            key={title}
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-gray-100 text-gray-500 transition-colors group-hover:bg-gray-900 group-hover:text-white dark:bg-gray-700 dark:text-gray-400 dark:group-hover:bg-gray-600">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
