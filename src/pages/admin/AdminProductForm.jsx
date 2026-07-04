import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import AdminLayout from './AdminLayout.jsx';
import ImageUploader from '../../components/admin/ImageUploader.jsx';
import Button from '../../components/ui/Button.jsx';
import useAdminAuth from '../../hooks/useAdminAuth.js';
import usePermissions from '../../hooks/usePermissions.js';
import PermissionGuard from '../../components/admin/PermissionGuard.jsx';
import { PERMISSIONS } from '../../config/permissions.js';
import { brands, categories } from '../../data/categories.js';
import { getProducts, saveProduct } from '../../services/productService.js';

const emptyProduct = {
  name: '',
  slug: '',
  brand: '',
  category: 'laptops',
  subCategory: '',
  price: '',
  oldPrice: '',
  stock: 'in_stock',
  stockQuantity: 1,
  warranty: '6 mois',
  badge: 'Disponible',
  condition: '',
  description: '',
  shortDescription: '',
  specs: [],
  processor: '',
  ram: '',
  storage: '',
  screenSize: '',
  graphics: '',
  color: '',
  model: '',
  year: '',
  deliveryAvailable: true,
  freeDelivery: true,
  softwareIncluded: '',
  isActive: true,
  sortOrder: 0,
  image: '',
  gallery: [],
  rating: 4.7,
  featured: false,
};

const slugify = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const parseSpecs = (value) => {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value.split('\n').map((line) => line.split(':').map((part) => part.trim())).filter((parts) => parts.length >= 2 && parts[0]);
  }
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAdminAuth();
  const isEdit = Boolean(id);
  const [product, setProduct] = useState(emptyProduct);
  const [specsText, setSpecsText] = useState('[]');
  const [galleryText, setGalleryText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getProducts({ fallback: false }).then((items) => {
      const found = items.find((item) => String(item.id) === String(id));
      if (found) {
        setProduct(found);
        setSpecsText(JSON.stringify(found.specs || [], null, 2));
        setGalleryText((found.gallery || []).join('\n'));
      }
    });
  }, [id, isEdit]);

  const update = (key, value) => setProduct((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await saveProduct({
        ...product,
        slug: product.slug || slugify(product.name),
        price: Number(product.price || 0),
        oldPrice: product.oldPrice === '' ? null : Number(product.oldPrice),
        rating: Number(product.rating || 4.7),
        stockQuantity: Number(product.stockQuantity || 0),
        sortOrder: Number(product.sortOrder || 0),
        year: product.year === '' ? null : Number(product.year),
        gallery: galleryText.split('\n').map((item) => item.trim()).filter(Boolean),
        specs: parseSpecs(specsText),
      }, auth.email);
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-black text-navy dark:text-white">{isEdit ? 'Modifier produit' : 'Ajouter produit'}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Renseignez les informations du produit et téléversez les images.</p>
      </div>

      <form onSubmit={submit} className="mx-auto grid w-full max-w-screen-2xl min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-card-dark sm:p-6">
          <h3 className="mb-4 text-lg font-black text-navy dark:text-white">Informations principales</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nom" value={product.name} onChange={(value) => update('name', value)} required />
            <Field label="Slug" value={product.slug} onChange={(value) => update('slug', slugify(value))} placeholder={slugify(product.name)} />
            <Select label="Marque" value={product.brand} onChange={(value) => update('brand', value)} options={brands} />
            <Select label="Catégorie" value={product.category} onChange={(value) => update('category', value)} options={categories.map((item) => item.id)} />
            <Field label="Sous-catégorie" value={product.subCategory} onChange={(value) => update('subCategory', value)} />
            <Field label="Garantie" value={product.warranty} onChange={(value) => update('warranty', value)} />
            <Field label="Badge" value={product.badge} onChange={(value) => update('badge', value)} />
            <Field label="Condition" value={product.condition} onChange={(value) => update('condition', value)} />
          </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-card-dark sm:p-6">
          <h3 className="mb-4 text-lg font-black text-navy dark:text-white">Prix et stock</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Prix" type="number" value={product.price} onChange={(value) => update('price', value)} required />
            <Field label="Ancien prix" type="number" value={product.oldPrice || ''} onChange={(value) => update('oldPrice', value)} />
            <Select label="Stock" value={product.stock} onChange={(value) => update('stock', value)} options={['in_stock', 'out_of_stock']} />
            <Field label="Quantité stock" type="number" value={product.stockQuantity ?? 0} onChange={(value) => update('stockQuantity', value)} />
          </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-card-dark sm:p-6">
          <h3 className="mb-4 text-lg font-black text-navy dark:text-white">Descriptions</h3>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Description courte</span>
            <textarea value={product.shortDescription || ''} onChange={(event) => update('shortDescription', event.target.value)} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Description</span>
            <textarea value={product.description} onChange={(event) => update('description', event.target.value)} className="min-h-36 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </label>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-card-dark sm:p-6">
          <h3 className="mb-4 text-lg font-black text-navy dark:text-white">Spécifications</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Processeur" value={product.processor} onChange={(value) => update('processor', value)} />
            <Field label="RAM" value={product.ram} onChange={(value) => update('ram', value)} />
            <Field label="Stockage" value={product.storage} onChange={(value) => update('storage', value)} />
            <Field label="Taille écran" value={product.screenSize} onChange={(value) => update('screenSize', value)} />
            <Field label="Graphiques" value={product.graphics} onChange={(value) => update('graphics', value)} />
            <Field label="Couleur" value={product.color} onChange={(value) => update('color', value)} />
            <Field label="Modèle" value={product.model} onChange={(value) => update('model', value)} />
            <Field label="Année" type="number" value={product.year || ''} onChange={(value) => update('year', value)} />
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Specs (JSON ou lignes Clé: Valeur)</span>
            <textarea value={specsText} onChange={(event) => setSpecsText(event.target.value)} className="min-h-44 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </label>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-card-dark sm:p-6">
          <h3 className="mb-4 text-lg font-black text-navy dark:text-white">Options</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Ordre affichage" type="number" value={product.sortOrder ?? 0} onChange={(value) => update('sortOrder', value)} />
            <Field label="Note" type="number" step="0.1" value={product.rating} onChange={(value) => update('rating', value)} />
            <Checkbox label="Livraison disponible" checked={product.deliveryAvailable} onChange={(value) => update('deliveryAvailable', value)} />
            <Checkbox label="Livraison gratuite" checked={product.freeDelivery} onChange={(value) => update('freeDelivery', value)} />
            <Checkbox label="Produit vedette" checked={product.featured} onChange={(value) => update('featured', value)} />
            <Checkbox label="Actif public" checked={product.isActive} onChange={(value) => update('isActive', value)} />
            <Field label="Logiciels inclus" value={product.softwareIncluded} onChange={(value) => update('softwareIncluded', value)} />
          </div>
          {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
          </section>
        </div>

        <aside className="min-w-0 space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-card-dark">
            <h3 className="font-black text-navy dark:text-white">Image principale</h3>
            {product.image && <img src={product.image} alt="" className="mt-4 aspect-[4/3] w-full rounded-2xl bg-slate-100 object-contain p-3 dark:bg-slate-800" />}
            <Field label="URL image" value={product.image} onChange={(value) => update('image', value)} />
            <PermissionGuard permission={PERMISSIONS.PRODUCTS_IMAGES_UPLOAD}>
              <ImageUploader product={{ ...product, slug: product.slug || slugify(product.name) }} label="Upload principal" onUploaded={(url) => update('image', url)} onError={setError} />
            </PermissionGuard>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-card-dark">
            <h3 className="font-black text-navy dark:text-white">Galerie</h3>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {galleryText.split('\n').map((item) => item.trim()).filter(Boolean).map((url) => (
                <div key={url} className="group relative">
                  <img src={url} alt="" className="aspect-square rounded-xl bg-slate-100 object-contain p-2 dark:bg-slate-800" />
                  <button type="button" onClick={() => setGalleryText((current) => current.split('\n').filter((line) => line.trim() !== url).join('\n'))} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-red-600 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <textarea value={galleryText} onChange={(event) => setGalleryText(event.target.value)} placeholder="Une URL par ligne" className="mt-4 min-h-36 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            <PermissionGuard permission={PERMISSIONS.PRODUCTS_IMAGES_UPLOAD}>
              <ImageUploader multiple product={{ ...product, slug: product.slug || slugify(product.name) }} label="Ajouter galerie" onUploaded={(urls) => setGalleryText((current) => [current, ...urls].filter(Boolean).join('\n'))} onError={setError} />
            </PermissionGuard>
          </div>
        </aside>
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:col-span-2 lg:mx-0 lg:rounded-2xl lg:border">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{isEdit ? 'Modifiez puis enregistrez les changements.' : 'Créez la fiche produit avec ses images et options.'}</p>
            <Button type="submit" disabled={saving}><Save className="h-5 w-5" /> {saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

function Field({ label, value, onChange, type = 'text', required = false, placeholder = '', step }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
      <input type={type} step={step} required={required} value={value ?? ''} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
    </label>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 rounded border-gray-300 text-gray-900" />
      {label}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white">
        <option value="">Choisir</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
