import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import AdminLayout from './AdminLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import SafeImage from '../../components/ui/SafeImage.jsx';
import useAdminAuth from '../../hooks/useAdminAuth.js';
import { listRepairServicesForAdmin, updateRepairService } from '../../services/adminRepairService.js';

export default function AdminRepairServices() {
  const auth = useAdminAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setServices(await listRepairServicesForAdmin());
    } catch (err) {
      setError(err.message || 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateLocal = (id, key, value) => {
    setServices((items) => items.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const save = async (service) => {
    setSavingId(service.id);
    setError('');
    setMessage('');
    try {
      const saved = await updateRepairService(service.id, service, auth.email);
      setServices((items) => items.map((item) => (item.id === saved.id ? saved : item)));
      setMessage('Service de réparation mis à jour.');
    } catch (err) {
      setError(err.message || 'Enregistrement impossible.');
    } finally {
      setSavingId('');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-black text-navy dark:text-white">Services réparation</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Modifiez les textes et photos utilisés sur la page réparation.</p>
      </div>

      {error && <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
      {message && <p className="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{message}</p>}
      {loading && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-soft dark:border-slate-800 dark:bg-card-dark">Chargement...</div>}

      <div className="grid gap-5">
        {!loading && services.map((service) => (
          <section key={service.id} className="grid min-w-0 gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-card-dark lg:grid-cols-[260px_minmax(0,1fr)_auto]">
            <SafeImage
              src={service.image}
              alt={service.title}
              className="aspect-[4/3] w-full rounded-xl bg-slate-100 dark:bg-slate-800"
              imageClassName="object-cover"
            />
            <div className="grid min-w-0 gap-3 md:grid-cols-2">
              <Field label="Titre" value={service.title} onChange={(value) => updateLocal(service.id, 'title', value)} />
              <Field label="Prix" value={service.priceLabel} onChange={(value) => updateLocal(service.id, 'priceLabel', value)} />
              <Field label="Image URL" value={service.image} onChange={(value) => updateLocal(service.id, 'image', value)} wide />
              <Field label="WhatsApp" value={service.whatsappMessage} onChange={(value) => updateLocal(service.id, 'whatsappMessage', value)} wide />
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Description</span>
                <textarea value={service.description} onChange={(event) => updateLocal(service.id, 'description', event.target.value)} className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </label>
              <Field label="Ordre" type="number" value={service.sortOrder} onChange={(value) => updateLocal(service.id, 'sortOrder', value)} />
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-800">
                <input type="checkbox" checked={service.isActive !== false} onChange={(event) => updateLocal(service.id, 'isActive', event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-gray-900" />
                Actif
              </label>
            </div>
            <Button type="button" onClick={() => save(service)} disabled={savingId === service.id} className="self-start">
              <Save className="h-4 w-4" /> {savingId === service.id ? '...' : 'Enregistrer'}
            </Button>
          </section>
        ))}
      </div>
    </AdminLayout>
  );
}

function Field({ label, value, onChange, type = 'text', wide = false }) {
  return (
    <label className={`block ${wide ? 'md:col-span-2' : ''}`}>
      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
      <input type={type} value={value ?? ''} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
    </label>
  );
}
