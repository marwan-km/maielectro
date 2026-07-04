import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { whatsappLink } from '../data/storeInfo.js';

const CART_STORAGE_KEY = 'maielectro.cart.v1';
const CartContext = createContext(null);

const isBrowser = typeof window !== 'undefined';

const formatMoney = (value) => Number(value || 0).toLocaleString('fr-MA');

const buildProductUrl = (product) => {
  if (!product?.slug) return '';
  if (!isBrowser) return `https://www.maielectro.com/product/${product.slug}`;
  return `${window.location.origin}/product/${product.slug}`;
};

const normalizeItem = (item) => {
  if (!item || !item.id) return null;
  return {
    id: item.id,
    slug: item.slug || '',
    name: item.name || '',
    price: Number(item.price || 0),
    quantity: Math.max(1, Number(item.quantity || 1)),
    url: item.url || buildProductUrl(item),
    image: item.image || '',
  };
};

const readStoredCart = () => {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map(normalizeItem).filter(Boolean)
      : [];
  } catch {
    return [];
  }
};

const sumCartCount = (items) => items.reduce((total, item) => total + Number(item.quantity || 0), 0);

const buildWhatsAppMessage = (items) => {
  if (!items.length) {
    return 'Bonjour MaiElectro, je veux commander des produits.';
  }

  const lines = ['Bonjour MaiElectro, je veux commander ces produits :', ''];
  items.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.name}`,
      `Quantité: ${item.quantity}`,
      `Prix: ${formatMoney(item.price)} DH`,
      `Lien: ${item.url}`,
      '',
    );
  });
  lines.push('Merci.');
  return lines.join('\n');
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => readStoredCart());
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (!isBrowser) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product) => {
    if (!product?.id) return;
    setCartItems((current) => {
      const normalized = normalizeItem({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        quantity: 1,
        url: buildProductUrl(product),
        image: product.image,
      });
      if (!normalized) return current;

      const existingIndex = current.findIndex((item) => item.id === normalized.id);
      if (existingIndex === -1) return [...current, normalized];

      return current.map((item, index) => (
        index === existingIndex
          ? { ...item, quantity: Number(item.quantity || 1) + 1 }
          : item
      ));
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((current) => current.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, qty) => {
    const nextQty = Math.max(0, Number(qty || 0));
    setCartItems((current) => current
      .map((item) => (item.id === productId ? { ...item, quantity: nextQty } : item))
      .filter((item) => item.quantity > 0));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((current) => !current), []);
  const getItemQuantity = useCallback((productId) => cartItems.find((item) => item.id === productId)?.quantity || 0, [cartItems]);
  const createWhatsAppOrderMessage = useCallback(() => buildWhatsAppMessage(cartItems), [cartItems]);
  const getCartCount = useCallback(() => sumCartCount(cartItems), [cartItems]);
  const sendWhatsAppOrder = useCallback(() => {
    if (!cartItems.length) return;
    if (!isBrowser) return;
    const url = whatsappLink(createWhatsAppOrderMessage());
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsCartOpen(false);
  }, [cartItems, createWhatsAppOrderMessage]);

  const value = useMemo(() => ({
    cartItems,
    cartCount: sumCartCount(cartItems),
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    getItemQuantity,
    getCartCount,
    createWhatsAppOrderMessage,
    sendWhatsAppOrder,
  }), [cartItems, isCartOpen, addToCart, removeFromCart, updateQuantity, clearCart, openCart, closeCart, toggleCart, getItemQuantity, getCartCount, createWhatsAppOrderMessage, sendWhatsAppOrder]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
