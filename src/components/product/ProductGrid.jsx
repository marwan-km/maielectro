import { memo } from 'react';
import ProductCard from './ProductCard.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

function ProductGrid({ products, emptyTitle, emptyDescription }) {
  const { t } = useI18n();

  if (!products.length) {
    return (
      <EmptyState
        title={emptyTitle || t('noProducts')}
        description={emptyDescription === undefined ? t('noProductsDesc') : emptyDescription}
        actionTo="/shop"
        actionLabel={t('backToShop')}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 min-w-0 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}

export default memo(ProductGrid);
