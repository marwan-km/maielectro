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
    <div className="grid min-w-0 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}

export default memo(ProductGrid);
