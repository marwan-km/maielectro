import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import AdminLayout from './AdminLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import AdminSkeleton from '../../components/admin/AdminSkeleton.jsx';
import useAdminAuth from '../../hooks/useAdminAuth.js';
import { defaultSettings, getSettings, updateSettings } from '../../services/settingsService.js';

export default function AdminSettings() {
  const auth = useAdminAuth();
  const [settings, setSettings] = useState({});
  const [settingRows, setSettingRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getSettings();
        const { rows = [], ...values } = data;
        if (mounted) {
          setSettings({ ...defaultSettings, ...values });
          setSettingRows(rows);
        }
      } catch (err) {
        if (mounted) {
          setSettings(defaultSettings);
          setSettingRows([]);
          setError(err.message || 'Chargement des paramètres impossible.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateSettings(settings, auth.email);
      const data = await getSettings();
      const { rows = [], ...values } = data;
      setSettings({ ...defaultSettings, ...values });
      setSettingRows(rows);
      setMessage('Paramètres enregistrés.');
    } catch (err) {
      setError(err.message || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><AdminSkeleton rows={6} /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-black text-navy dark:text-white">Paramètres du Site</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gérez les informations générales de la boutique.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-card-dark sm:p-6">
        {error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
        {message && <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{message}</p>}
        <h3 className="text-xl font-black">Informations de contact</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Nom boutique" value={settings.store_name || ''} onChange={(value) => handleChange('store_name', value)} />
          <Field label="Numéro de téléphone" value={settings.phone || ''} onChange={(value) => handleChange('phone', value)} />
          <Field label="Numéro WhatsApp" value={settings.whatsapp || ''} onChange={(value) => handleChange('whatsapp', value)} />
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-bold">Adresse de la boutique</span>
          <textarea value={settings.address || ''} onChange={e => handleChange('address', e.target.value)} className="min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <Field label="Horaires" value={settings.hours || ''} onChange={(value) => handleChange('hours', value)} />
        
        <h3 className="pt-4 text-xl font-black">Messages du site</h3>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">Bandeau d'annonce (Promo bar)</span>
          <input type="text" value={settings.promo_bar_text || ''} onChange={e => handleChange('promo_bar_text', e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">Message livraison</span>
          <input type="text" value={settings.delivery_message || ''} onChange={e => handleChange('delivery_message', e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">Message garantie</span>
          <input type="text" value={settings.warranty_message || ''} onChange={e => handleChange('warranty_message', e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800" />
        </label>

        <h3 className="pt-4 text-xl font-black">Réseaux sociaux</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {['facebook', 'instagram', 'youtube'].map((key) => (
            <label key={key} className="block">
              <span className="mb-1 block text-sm font-bold capitalize">{key}</span>
              <input type="text" value={settings.social_links?.[key] || ''} onChange={e => handleChange('social_links', { ...(settings.social_links || {}), [key]: e.target.value })} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800" />
            </label>
          ))}
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-5 w-5" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>

      <section className="mt-6 max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-card-dark">
        <h3 className="text-xl font-black text-navy dark:text-white">Paramètres chargés</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{settingRows.length} ligne(s) depuis Supabase.</p>
        <div className="mt-4 grid gap-2">
          {settingRows.map((row) => (
            <div key={row.key} className="grid gap-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-900/50 md:grid-cols-[180px_minmax(0,1fr)]">
              <span className="font-black text-navy dark:text-white">{row.key}</span>
              <span className="min-w-0 break-words text-slate-600 dark:text-slate-300">{typeof row.value === 'string' ? row.value : JSON.stringify(row.value)}</span>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800" />
    </label>
  );
}
