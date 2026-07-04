import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import AdminLayout from './AdminLayout.jsx';
import AdminTable from '../../components/admin/AdminTable.jsx';
import AdminSkeleton from '../../components/admin/AdminSkeleton.jsx';
import StockToggleButton, { stockLabel } from '../../components/admin/StockToggleButton.jsx';
import useAdminAuth from '../../hooks/useAdminAuth.js';
import usePermissions from '../../hooks/usePermissions.js';
import PermissionGuard from '../../components/admin/PermissionGuard.jsx';
import { PERMISSIONS } from '../../config/permissions.js';
import { getProducts, updateProductStock } from '../../services/productService.js';

export default function AdminStock() {
  const auth = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setProducts(await getProducts({ fallback: false }));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products
      .filter((product) => !status || product.stock === status)
      .filter((product) => product.name.toLowerCase().includes(q) || product.slug.toLowerCase().includes(q));
  }, [products, search, status]);

  const toggle = async (product, nextStock) => {
    try {
      await updateProductStock(product.id, nextStock, nextStock === 'in_stock' ? Math.max(product.stockQuantity || 1, 1) : 0, auth.email);
      await load();
    } catch (err) {
      setError(err.message || 'Changement stock impossible.');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-black text-navy dark:text-white">Stock</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Mettez les produits en stock ou en rupture.</p>
      </div>
      <div className="mb-5 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-card-dark md:grid-cols-[1fr_220px]">
        <label className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher..." className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          <option value="">Tous les stocks</option>
          <option value="in_stock">En stock</option>
          <option value="out_of_stock">Rupture</option>
        </select>
      </div>
      {error && <p className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
      {loading ? <AdminSkeleton rows={6} /> : (
      <AdminTable columns={['Produit', 'Stock', 'Quantité', 'Action']}>
        {filtered.map((product) => (
          <tr key={product.id}>
            <td className="px-5 py-4 font-black text-navy dark:text-white"><span className="line-clamp-2">{product.name}</span></td>
            <td className="px-5 py-4">{stockLabel(product.stock)}</td>
            <td className="px-5 py-4">{product.stockQuantity ?? 0}</td>
            <td className="px-5 py-4">
              <PermissionGuard permission={PERMISSIONS.STOCK_UPDATE}>
                <StockToggleButton product={product} onToggle={toggle} />
              </PermissionGuard>
            </td>
          </tr>
        ))}
      </AdminTable>
      )}
    </AdminLayout>
  );
}
