import { Link, useParams } from 'react-router-dom';
import ProductDetails from '../components/product/ProductDetails.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import SectionTitle from '../components/ui/SectionTitle.jsx';
import { useProductData } from '../context/ProductDataContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function ProductPage() {
  const { t } = useI18n();
  const { products, getProductBySlug } = useProductData();
  const { slug } = useParams();
  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <section className="container-shell py-16 text-center">
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-black text-navy dark:text-white">{t('productNotFound')}</h1>
          <Link to="/shop" className="mt-4 inline-block font-bold text-gray-600 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white">{t('backToShop')}</Link>
        </div>
      </section>
    );
  }

  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);

  return (
    <>
      <ProductDetails product={product} />
      <section className="container-shell pb-16">
        <SectionTitle title={t('relatedProducts')} />
        <ProductGrid products={related} />
      </section>
    </>
  );
}
