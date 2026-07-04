import { LogOut, Menu, Store } from 'lucide-react';
import { Button as HeroButton } from '@heroui/react/button';
import { Link } from 'react-router-dom';
import RoleBadge from './RoleBadge.jsx';

export default function AdminTopbar({ admin, title = 'Administration', onLogout, onMenuOpen }) {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95 sm:px-5 lg:py-4">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <HeroButton
            type="button"
            isIconOnly
            onPress={onMenuOpen}
            variant="bordered"
            radius="lg"
            className="border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 lg:hidden"
            aria-label="Ouvrir le menu admin"
          >
            <Menu className="h-5 w-5" />
          </HeroButton>
          <h1 className="min-w-0 truncate text-lg font-black text-gray-900 dark:text-white sm:text-xl">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <Link
            to="/"
            className="hidden h-9 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 md:inline-flex"
          >
            <Store className="h-4 w-4" /> Boutique
          </Link>
          <div className="hidden min-w-0 items-center gap-2 rounded-xl border border-gray-200 bg-white py-1.5 pl-3 pr-1.5 dark:border-gray-700 dark:bg-gray-800 sm:flex">
            <span className="block max-w-[140px] truncate text-sm font-semibold text-gray-700 dark:text-gray-300 lg:max-w-[160px] xl:max-w-[220px]">
              {admin?.full_name || admin?.email}
            </span>
            <RoleBadge role={admin?.role} />
          </div>

          <HeroButton
            isIconOnly
            onPress={onLogout}
            variant="flat"
            radius="full"
            className="bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
            aria-label="Déconnexion"
          >
            <LogOut className="h-4 w-4" />
          </HeroButton>
        </div>
      </div>
    </header>
  );
}
