import { useEffect, useMemo, useState } from 'react';
import { Button as HeroButton } from '@heroui/react/button';
import { Card } from '@heroui/react/card';
import { Chip } from '@heroui/react/chip';
import { Input } from '@heroui/react/input';
import { Link } from 'react-router-dom';
import { Edit, Eye, PlusCircle, Search, Trash2 } from 'lucide-react';
import AdminLayout from './AdminLayout.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import StockToggleButton, { stockLabel } from '../../components/admin/StockToggleButton.jsx';
import Button from '../../components/ui/Button.jsx';
import useAdminAuth from '../../hooks/useAdminAuth.js';
import usePermissions from '../../hooks/usePermissions.js';
import PermissionGuard from '../../components/admin/PermissionGuard.jsx';
import AdminSkeleton from '../../components/admin/AdminSkeleton.jsx';
import { PERMISSIONS } from '../../config/permissions.js';
import { brands, categories } from '../../data/categories.js';
import { deleteProduct, getProducts, updateProductStock } from '../../services/productService.js';
import { formatAdminDateOnly } from '../../utils/date.js';

export default function AdminProducts() {
  const auth = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      setProducts(await getProducts({ fallback: false }));
    } catch (err) {
      setError(err.message || 'Impossible de charger les produits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products
      .filter((product) => !category || product.category === category)
      .filter((product) => !brand || product.brand === brand)
      .filter((product) => !stock || product.stock === stock)
      .filter((product) => product.name.toLowerCase().includes(q) || product.slug.toLowerCase().includes(q) || product.brand.toLowerCase().includes(q));
  }, [products, search, category, brand, stock]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id, auth.email);
      setDeleteTarget(null);
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Suppression impossible.');
    }
  };

  const toggleStock = async (product, nextStock) => {
    try {
      await updateProductStock(product.id, nextStock, nextStock === 'in_stock' ? Math.max(product.stockQuantity || 1, 1) : 0, auth.email);
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Changement stock impossible.');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-black text-navy dark:text-white">Produits</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{filteredProducts.length} produit(s)</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.PRODUCTS_CREATE}>
          <Button to="/admin/products/new"><PlusCircle className="h-5 w-5" /> Ajouter produit</Button>
        </PermissionGuard>
      </div>

      <Card className="mb-5 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-card-dark md:grid-cols-[1fr_200px_200px_200px]">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un produit..." radius="lg" variant="bordered" startContent={<Search className="h-5 w-5 text-slate-400" />} classNames={{ inputWrapper: 'h-12 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800' }} />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          <option value="">Toutes catégories</option>
          {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select value={brand} onChange={(event) => setBrand(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          <option value="">Toutes marques</option>
          {brands.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={stock} onChange={(event) => setStock(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          <option value="">Tous stocks</option>
          <option value="in_stock">En stock</option>
          <option value="out_of_stock">Rupture</option>
        </select>
      </Card>

      {error && <p className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}

      {loading ? (
        <AdminSkeleton rows={7} />
      ) : (
      <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-card-dark">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">Produit</th>
                <th className="px-5 py-4">Marque</th>
                <th className="px-5 py-4">Catégorie</th>
                <th className="px-5 py-4">Prix</th>
                <th className="px-5 py-4">Stock</th>
                <th className="px-5 py-4">Etat</th>
                <th className="px-5 py-4">Mis à jour</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <img src={product.image} alt="" loading="lazy" decoding="async" className="h-20 w-24 shrink-0 rounded-2xl bg-slate-100 object-contain p-2 dark:bg-slate-800" />
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-black text-navy dark:text-white">{product.name}</p>
                        <p className="truncate text-xs text-slate-500">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{product.brand}</td>
                  <td className="px-5 py-4">{product.category}</td>
                  <td className="px-5 py-4 font-black">{product.price.toLocaleString()} DH</td>
                  <td className="px-5 py-4"><Chip color={product.stock === 'out_of_stock' ? 'danger' : 'success'} variant="flat" radius="full" size="sm" className="font-black">{stockLabel(product.stock)}</Chip></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {product.featured && <Chip color="warning" variant="flat" radius="full" size="sm" className="font-black">Vedette</Chip>}
                      <Chip color={product.isActive ? 'primary' : 'default'} variant="flat" radius="full" size="sm" className="font-black">{product.isActive ? 'Actif' : 'Masqué'}</Chip>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{formatAdminDateOnly(product.updatedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <HeroButton as="a" href={`/product/${product.slug}`} target="_blank" rel="noreferrer" isIconOnly variant="bordered" radius="lg" className="border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"><Eye className="h-4 w-4" /></HeroButton>
                      <PermissionGuard permission={PERMISSIONS.STOCK_UPDATE}>
                        <StockToggleButton product={product} onToggle={toggleStock} />
                      </PermissionGuard>
                      <PermissionGuard permission={PERMISSIONS.PRODUCTS_UPDATE}>
                        <HeroButton as={Link} to={`/admin/products/edit/${product.id}`} isIconOnly variant="bordered" radius="lg" className="border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"><Edit className="h-4 w-4" /></HeroButton>
                      </PermissionGuard>
                      <PermissionGuard permission={PERMISSIONS.PRODUCTS_DELETE}>
                        <HeroButton onPress={() => setDeleteTarget(product)} isIconOnly variant="bordered" radius="lg" color="danger"><Trash2 className="h-4 w-4" /></HeroButton>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredProducts.length && <tr><td colSpan="8" className="px-5 py-8 text-center text-slate-500">Aucun produit trouvé.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      )}

      {deleteTarget && (
        <ConfirmDialog danger title="Supprimer le produit ?" description={`Cette action supprimera “${deleteTarget.name}”.`} confirmLabel="Supprimer" onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
      )}
    </AdminLayout>
  );
}
