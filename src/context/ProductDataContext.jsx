import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { resolveProductCategory, resolveProductSubCategory } from '../utils/productClassification.js';

const ProductDataContext = createContext(null);

const filterProductsByCategory = (items, categoryId) => {
  const category = String(categoryId || '').toLowerCase();
  if (!category || category === 'shop') return items;
  if (category === 'laptops') return items.filter((product) => resolveProductCategory(product) === 'laptops');
  if (category === 'macbook') {
    return items.filter((product) => {
      const name = String(product.name || '').toLowerCase();
      const brand = String(product.brand || '').toLowerCase();
      return resolveProductCategory(product) === 'laptops' && (/macbook|ipad/.test(name) || brand.includes('apple'));
    });
  }
  if (['lenovo', 'dell', 'hp'].includes(category)) {
    return items.filter((product) => {
      const brand = String(product.brand || '').toLowerCase();
      const name = String(product.name || '').toLowerCase();
      return resolveProductCategory(product) === 'laptops' && (brand.includes(category) || name.includes(category));
    });
  }
  return items.filter((product) => resolveProductCategory(product) === category || resolveProductSubCategory(product) === category);
};

const loadProducts = async () => {
  const { getProducts } = await import('../services/productService.js');
  return getProducts({ fallback: true });
};

export function ProductDataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await loadProducts());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await loadProducts();
        if (mounted) setProducts(data);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const productsByCategory = useMemo(() => {
    const cache = new Map();
    return (categoryId) => {
      const key = String(categoryId || 'shop').toLowerCase();
      if (!cache.has(key)) cache.set(key, filterProductsByCategory(products, categoryId));
      return cache.get(key);
    };
  }, [products]);

  const productByKey = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      if (product.slug) map.set(String(product.slug), product);
      if (product.id != null) map.set(String(product.id), product);
    });
    return map;
  }, [products]);

  const value = useMemo(() => ({
    products,
    loading,
    refreshProducts,
    getProductBySlug: (slug) => productByKey.get(String(slug)),
    getProductsByCategory: productsByCategory,
  }), [products, loading, refreshProducts, productByKey, productsByCategory]);

  return <ProductDataContext.Provider value={value}>{children}</ProductDataContext.Provider>;
}

export const useProductData = () => useContext(ProductDataContext);
