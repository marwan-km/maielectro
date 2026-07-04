import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { FolderTree, Package, PlusCircle, ShieldCheck, Warehouse, Users, Settings } from 'lucide-react';
import AdminStatCard from '../../components/admin/AdminStatCard.jsx';
import AdminSkeleton from '../../components/admin/AdminSkeleton.jsx';
import AdminLayout from './AdminLayout.jsx';
import useAdminAuth from '../../hooks/useAdminAuth.js';
import usePermissions from '../../hooks/usePermissions.js';
import { PERMISSIONS } from '../../config/permissions.js';
import { getProducts } from '../../services/productService.js';
import { listAdminCategories } from '../../services/categoryService.js';
import { listAdminLogs, listStockLogs } from '../../services/logService.js';
import { formatAdminDate } from '../../utils/date.js';

export default function AdminDashboard() {
  const auth = useAdminAuth();
  const { can } = usePermissions();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      getProducts({ fallback: false }),
      listAdminCategories(),
      listAdminLogs({ ownOnly: !can(PERMISSIONS.LOGS_VIEW_ALL), email: auth.email }),
      listStockLogs({ ownOnly: !can(PERMISSIONS.LOGS_VIEW_ALL), email: auth.email }),
    ]).then(([productData, categoryData, logData, stockLogData]) => {
      setProducts(productData);
      setCategories(categoryData);
      setLogs(logData.slice(0, 6));
      setStockLogs(stockLogData.slice(0, 6));
    }).catch((err) => {
      setError(err.message || 'Chargement du tableau de bord impossible.');
    }).finally(() => setLoading(false));
  }, [auth.email, can]);

  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter((product) => product.isActive !== false).length,
    inStock: products.filter((product) => product.stock !== 'out_of_stock').length,
    outOfStock: products.filter((product) => product.stock === 'out_of_stock').length,
  }), [products]);

  const quickLinks = [
    { title: 'Produits', text: 'Voir le catalogue', to: '/admin/products', icon: Package, show: can(PERMISSIONS.PRODUCTS_VIEW) },
    { title: 'Ajouter', text: 'Nouvelle fiche', to: '/admin/products/new', icon: PlusCircle, show: can(PERMISSIONS.PRODUCTS_CREATE) },
    { title: 'Catégories', text: 'Gérer les catégories', to: '/admin/categories', icon: FolderTree, show: can(PERMISSIONS.CATEGORIES_VIEW) },
    { title: 'Stock', text: 'Gérer les stocks', to: '/admin/stock', icon: Warehouse, show: can(PERMISSIONS.STOCK_VIEW) },
    { title: 'Admins', text: 'Gérer l\'équipe', to: '/admin/admins', icon: Users, show: can(PERMISSIONS.ADMINS_VIEW) },
    { title: 'Logs', text: 'Audit des actions', to: '/admin/logs', icon: ShieldCheck, show: can(PERMISSIONS.LOGS_VIEW_ALL) || can(PERMISSIONS.LOGS_VIEW_OWN) },
    { title: 'Paramètres', text: 'Configuration', to: '/admin/settings', icon: Settings, show: can(PERMISSIONS.SETTINGS_VIEW) },
  ].filter(l => l.show);

  return (
    <AdminLayout>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Administration</p>
        <h2 className="mt-2 text-3xl font-black text-navy dark:text-white">Tableau de bord</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Gérez votre plateforme MaiElectro depuis cet espace sécurisé.</p>
      </div>

      {error && <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
      {loading && <AdminSkeleton rows={5} />}
      
      {!loading && <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard title="Total produits" value={stats.total} icon={Package} />
        <AdminStatCard title="Produits actifs" value={stats.active} icon={ShieldCheck} tone="blue" />
        <AdminStatCard title="En stock" value={stats.inStock} icon={Warehouse} tone="green" />
        <AdminStatCard title="Rupture" value={stats.outOfStock} icon={Warehouse} tone="red" />
        <AdminStatCard title="Catégories" value={categories.length} icon={FolderTree} tone="amber" />
      </div>}

      {!loading && <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.title} to={link.to} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-premium dark:border-slate-800 dark:bg-card-dark">
            <link.icon className="h-8 w-8 text-gray-400" />
            <h3 className="mt-5 text-lg font-black text-navy dark:text-white">{link.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{link.text}</p>
          </Link>
        ))}
      </div>}
      
      {!loading && <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Panel title="Dernières actions" items={logs} render={(item) => `${item.admin_email || '-'} · ${item.action}`} />
        <Panel title="Changements de stock" items={stockLogs} render={(item) => `${item.admin_email || '-'} · ${item.old_stock || '-'} → ${item.new_stock || '-'}`} />
      </div>}
      {!loading && <Panel title="Derniers produits" items={products.slice(0, 6)} render={(item) => `${item.name} · ${item.price.toLocaleString()} DH · ${item.stock}`} />}
    </AdminLayout>
  );
}

function Panel({ title, items, render }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-card-dark">
      <h3 className="text-xl font-black text-navy dark:text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length ? items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
            {render(item)}
            <p className="mt-1 text-xs font-medium text-slate-400">{formatAdminDate(item.created_at || item.createdAt || item.updated_at || item.updatedAt)}</p>
          </div>
        )) : <p className="text-sm text-slate-500">Aucune donnée.</p>}
      </div>
    </section>
  );
}
