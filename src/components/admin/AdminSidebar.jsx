import { BarChart3, FolderTree, LogOut, Package, PlusCircle, RotateCcw, Settings, Shield, ShieldCheck, Store, Warehouse, X } from 'lucide-react';
import { Button as HeroButton } from '@heroui/react/button';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from '../ui/BrandLogo.jsx';

const ADMIN_NAV_ITEMS = [
  { to: '/admin', label: 'Tableau de bord', icon: BarChart3, match: (path) => path === '/admin' },
  { to: '/admin/products', label: 'Produits', icon: Package, match: (path) => path === '/admin/products' || path.startsWith('/admin/products/edit') },
  { to: '/admin/products/new', label: 'Ajouter produit', icon: PlusCircle, match: (path) => path === '/admin/products/new' },
  { to: '/admin/categories', label: 'Catégories', icon: FolderTree, match: (path) => path === '/admin/categories' },
  { to: '/admin/stock', label: 'Stock', icon: Warehouse, match: (path) => path === '/admin/stock' },
  { to: '/admin/admins', label: 'Administrateurs', icon: Shield, match: (path) => path === '/admin/admins' },
  { to: '/admin/logs', label: 'Logs', icon: RotateCcw, match: (path) => path === '/admin/logs' },
  { to: '/admin/settings', label: 'Paramètres', icon: Settings, match: (path) => path === '/admin/settings' },
  { to: '/admin/help', label: 'Aide', icon: ShieldCheck, match: (path) => path === '/admin/help' },
];

export default function AdminSidebar({ onLogout, isOpen = false, onClose }) {
  const location = useLocation();

  const content = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-6 flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <BrandLogo size="md" tone="dark" />
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Administration</p>
        </div>
        <HeroButton
          type="button"
          isIconOnly
          onPress={onClose}
          variant="flat"
          radius="lg"
          className="bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white lg:hidden"
          aria-label="Fermer le menu admin"
        >
          <X className="h-5 w-5" />
        </HeroButton>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(location.pathname);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              aria-current={isActive ? 'page' : undefined}
              className={`group flex h-11 min-w-0 items-center gap-3 rounded-[14px] px-3.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-950'
                    : 'text-gray-400 group-hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 shrink-0 space-y-1.5 border-t border-white/10 pt-4">
        <Link
          to="/"
          onClick={onClose}
          className="group flex h-11 min-w-0 items-center gap-3 rounded-[14px] px-3.5 text-sm font-semibold text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-gray-400 transition-colors group-hover:text-white">
            <Store className="h-4 w-4" />
          </span>
          <span className="truncate">Retour boutique</span>
        </Link>

        <HeroButton
          onPress={onLogout}
          variant="flat"
          radius="lg"
          className="group h-11 w-full justify-start gap-3 rounded-[14px] bg-transparent px-3.5 text-sm font-semibold text-gray-400 hover:bg-white/10 hover:text-white data-[hover=true]:bg-white/10"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-gray-400 transition-colors group-hover:text-white">
            <LogOut className="h-4 w-4" />
          </span>
          <span className="truncate">Déconnexion</span>
        </HeroButton>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-[280px] overflow-x-hidden border-r border-white/10 bg-gray-950 p-5 text-white lg:flex">
        {content}
      </aside>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm" onClick={onClose} aria-label="Fermer le menu admin" />
          <aside className="absolute inset-y-0 left-0 flex w-[min(86vw,300px)] flex-col bg-gray-950 p-5 text-white shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
