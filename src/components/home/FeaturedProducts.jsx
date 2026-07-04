import { Link } from 'react-router-dom';
import { useProductData } from '../../context/ProductDataContext.jsx';
import ProductCard from '../product/ProductCard.jsx';
import Button from '../ui/Button.jsx';
import SectionTitle from '../ui/SectionTitle.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function FeaturedProducts({ title, subtitle, category, limit = 4 }) {
  const { t } = useI18n();
  const { products, getProductsByCategory } = useProductData();
  const source = getProductsByCategory(category);
  const items = (source.length ? source : products.filter((product) => product.category === category)).slice(0, limit);

  return (
    <section className="container-shell py-14">
      <SectionTitle
        title={title}
        description={subtitle}
        action={<Button to={`/category/${category}`} variant="secondary">{t('viewAll')}</Button>}
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {items.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      {category === 'pieces-detachees' && (
        <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
          {t('needRef')}{' '}
          <Link to="/contact" className="font-bold text-gray-900 hover:underline dark:text-gray-100">
            {t('contactShop')}
          </Link>.
        </p>
      )}
    </section>
  );
}
