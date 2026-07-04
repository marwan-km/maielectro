import BrandShowcase from '../components/home/BrandShowcase.jsx';
import CategoryGrid from '../components/home/CategoryGrid.jsx';
import FeaturedProducts from '../components/home/FeaturedProducts.jsx';
import HeroSection from '../components/home/HeroSection.jsx';
import PromoBanner from '../components/home/PromoBanner.jsx';
import RepairSection from '../components/home/RepairSection.jsx';
import ServicesSection from '../components/home/ServicesSection.jsx';
import StoreInfo from '../components/home/StoreInfo.jsx';
import Testimonials from '../components/home/Testimonials.jsx';
import Button from '../components/ui/Button.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function Home() {
  const { t } = useI18n();

  return (
    <>
      <HeroSection />
      <PromoBanner />
      <ServicesSection />
      <BrandShowcase />
      <FeaturedProducts title={t('laptopsTitle')} subtitle={t('laptopsSubtitle')} category="laptops" />
      <FeaturedProducts title="Lenovo" subtitle={t('lenovoSubtitle')} category="lenovo" limit={4} />
      <FeaturedProducts title="Dell" subtitle={t('dellSubtitle')} category="dell" limit={4} />
      <FeaturedProducts title="HP" subtitle={t('hpSubtitle')} category="hp" limit={4} />
      <FeaturedProducts title="MacBook" subtitle={t('macbookSubtitle')} category="macbook" limit={4} />
      <CategoryGrid />
      <FeaturedProducts title={t('accessoiresTitle')} subtitle={t('accessoiresSubtitle')} category="accessoires" limit={4} />
      <FeaturedProducts title="iPhone" subtitle={t('iphoneSubtitle')} category="iphone" limit={4} />
      <FeaturedProducts title={t('piecesTitle')} subtitle={t('piecesSubtitle')} category="pieces-detachees" limit={4} />
      <RepairSection />
      <Testimonials />
      <StoreInfo />

      {/* Newsletter */}
      <section className="container-shell pb-16">
        <div className="rounded-2xl bg-gray-950 p-8 text-white shadow-sm md:p-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black md:text-4xl">{t('newsletterTitle')}</h2>
            <p className="mt-3 text-gray-400">{t('newsletterDesc')}</p>
          </div>
          <div className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              className="min-w-0 flex-1 rounded-xl border border-gray-700 bg-gray-900 px-5 py-4 text-white outline-none placeholder:text-gray-500 focus:border-gray-500 transition-colors"
              placeholder={t('yourEmail')}
            />
            <Button variant="secondary">{t('subscribe')}</Button>
          </div>
        </div>
      </section>
    </>
  );
}
