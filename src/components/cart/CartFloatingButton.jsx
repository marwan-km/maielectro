import { Button as HeroButton } from '@heroui/react/button';
import { Card } from '@heroui/react/card';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function CartFloatingButton() {
  const {
    cartItems,
    cartCount,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    sendWhatsAppOrder,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={closeCart}
        aria-label="Fermer le panier"
      />
      <Card className="absolute inset-x-3 bottom-3 mx-auto max-h-[82vh] w-[calc(100vw-24px)] max-w-none overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800 sm:inset-x-auto sm:right-6 sm:bottom-20 sm:w-full sm:max-w-lg md:max-w-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Panier</h2>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{cartCount} article(s)</p>
          </div>
          <HeroButton type="button" isIconOnly variant="flat" radius="lg" onPress={closeCart} className="text-gray-500">
            <X className="h-4 w-4" />
          </HeroButton>
        </div>

        <div className="max-h-[52vh] overflow-y-auto px-4 py-4">
          {cartItems.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-4 text-sm font-semibold text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              Aucun produit dans le panier.
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/60">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold leading-5 text-gray-900 dark:text-white">{item.name}</p>
                      <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400">{Number(item.price || 0).toLocaleString()} DH</p>
                    </div>
                    <HeroButton type="button" isIconOnly variant="flat" radius="lg" onPress={() => removeFromCart(item.id)} className="text-gray-400">
                      <Trash2 className="h-4 w-4" />
                    </HeroButton>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="grid h-9 w-9 place-items-center text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        aria-label="Réduire la quantité"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-10 px-3 text-center text-sm font-black text-gray-900 dark:text-white">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="grid h-9 w-9 place-items-center text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <a
                      href={item.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-gray-500 underline-offset-4 hover:underline dark:text-gray-400"
                    >
                      Voir le produit
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-4 py-4 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm font-semibold text-gray-600 dark:text-gray-300">
            <button type="button" onClick={clearCart} className="text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-white">Vider le panier</button>
            <span>{cartItems.length} produit(s)</span>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={closeCart}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-700 sm:flex-1"
            >
              Fermer
            </button>
            <button
              type="button"
              disabled={!cartItems.length}
              onClick={sendWhatsAppOrder}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-[2]"
            >
              Envoyer la commande sur WhatsApp
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
