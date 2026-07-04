import { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar.jsx';
import AdminTopbar from '../../components/admin/AdminTopbar.jsx';
import useAdminAuth from '../../hooks/useAdminAuth.js';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/admin': 'Tableau de bord',
  '/admin/products': 'Produits',
  '/admin/products/new': 'Ajouter produit',
  '/admin/categories': 'Catégories',
  '/admin/stock': 'Stock',
  '/admin/repair-services': 'Services réparation',
  '/admin/admins': 'Administrateurs',
  '/admin/logs': 'Logs',
  '/admin/settings': 'Paramètres',
  '/admin/help': 'Aide',
};

export default function AdminLayout({ children }) {
  const auth = useAdminAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = location.pathname.startsWith('/admin/products/edit')
    ? 'Modifier produit'
    : pageTitles[location.pathname] || 'Administration';

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-ink dark:bg-slate-950 dark:text-slate-200">
      <div className="min-h-screen w-full min-w-0">
        <AdminSidebar onLogout={auth.logout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <section className="flex min-h-screen min-w-0 flex-col overflow-x-hidden lg:ml-[280px] lg:w-[calc(100%_-_280px)]">
          <AdminTopbar admin={auth.admin} onLogout={auth.logout} title={title} onMenuOpen={() => setSidebarOpen(true)} />
          <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-5 sm:px-5 lg:px-8 lg:py-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
