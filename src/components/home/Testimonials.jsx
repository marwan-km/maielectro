import { Star } from 'lucide-react';
import { testimonials } from '../../data/testimonials.js';
import SectionTitle from '../ui/SectionTitle.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function Testimonials() {
  const { t } = useI18n();

  return (
    <section className="container-shell py-16">
      <SectionTitle eyebrow={t('customerReviews')} title={t('reviewsTitle')} />
      <div className="grid gap-5 lg:grid-cols-3">
        {testimonials.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark p-6 shadow-soft transition-all duration-300 hover:shadow-premium">
            <div className="mb-4 flex text-amber-400">{Array.from({ length: item.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
            <p className="leading-7 text-slate-600 dark:text-slate-400">"{item.text}"</p>
            <div className="mt-6 flex items-center gap-3">
              <img src={item.image} alt="" className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 object-cover" />
              <div>
                <h3 className="font-black text-navy dark:text-white">{item.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
