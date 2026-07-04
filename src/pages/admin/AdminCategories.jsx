import { useEffect, useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import AdminLayout from './AdminLayout.jsx';
import ImageUploader from '../../components/admin/ImageUploader.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import useAdminAuth from '../../hooks/useAdminAuth.js';
import usePermissions from '../../hooks/usePermissions.js';
import PermissionGuard from '../../components/admin/PermissionGuard.jsx';
import { PERMISSIONS } from '../../config/permissions.js';
import { deleteCategory, listAdminCategories, saveCategory } from '../../services/categoryService.js';

const emptyCategory = { id: '', name: '', slug: '', description: '', image: '' };

const slugify = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

export default function AdminCategories() {
  const auth = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyCategory);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    try {
      setCategories(await listAdminCategories());
    } catch (err) {
      setError(err.message || 'Chargement impossible.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await saveCategory({ ...form, slug: form.slug || slugify(form.name) }, auth.email);
      setForm(emptyCategory);
      await load();
    } catch (err) {
      setError(err.message || 'Enregistrement impossible.');
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id, auth.email);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err.message || 'Suppression impossible.');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-black text-navy dark:text-white">Catégories</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gérez le nom, slug, description et image des catégories.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <PermissionGuard permission={PERMISSIONS.CATEGORIES_UPDATE} fallback={<div className="hidden"></div>}>
          <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-card-dark">
            <h3 className="text-xl font-black text-navy dark:text-white">{form.id ? 'Modifier catégorie' : 'Ajouter catégorie'}</h3>
            <Field label="Nom" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
          <Field label="Slug" value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: slugify(value) }))} placeholder={slugify(form.name)} />
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Description</span>
            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </label>
          <Field label="Image URL" value={form.image} onChange={(value) => setForm((current) => ({ ...current, image: value }))} />
          <ImageUploader folder="categories" label="Upload image" onUploaded={(url) => setForm((current) => ({ ...current, image: url }))} onError={setError} />
          {form.image && <img src={form.image} alt="" loading="lazy" decoding="async" className="aspect-video w-full rounded-2xl bg-slate-100 object-contain p-3 dark:bg-slate-800" />}
          {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit"><Save className="h-5 w-5" /> Enregistrer</Button>
              {form.id && <button type="button" onClick={() => setForm(emptyCategory)} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-black dark:border-slate-700">Annuler</button>}
            </div>
          </form>
        </PermissionGuard>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-card-dark">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-4">Catégorie</th>
                  <th className="px-5 py-4">Slug</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={category.image} alt="" loading="lazy" decoding="async" className="h-12 w-12 rounded-2xl bg-slate-100 object-contain p-1 dark:bg-slate-800" />
                        <span className="font-black text-navy dark:text-white">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">{category.slug}</td>
                    <td className="px-5 py-4 text-slate-500">{category.description}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <PermissionGuard permission={PERMISSIONS.CATEGORIES_UPDATE}>
                          <button onClick={() => setForm(category)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">Modifier</button>
                        </PermissionGuard>
                        <PermissionGuard permission={PERMISSIONS.CATEGORIES_DELETE}>
                          <button onClick={() => setDeleteTarget(category)} className="grid h-10 w-10 place-items-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300"><Trash2 className="h-4 w-4" /></button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {deleteTarget && (
        <ConfirmDialog
          danger
          title="Supprimer la catégorie ?"
          description={`Cette action supprimera ${deleteTarget.name}.`}
          confirmLabel="Supprimer"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={remove}
        />
      )}
    </AdminLayout>
  );
}

function Field({ label, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
      <input type={type} required={required} value={value || ''} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
    </label>
  );
}
