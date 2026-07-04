import { RefreshCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout.jsx';
import { listAdminLogs } from '../../services/logService.js';
import useAdminAuth from '../../hooks/useAdminAuth.js';
import usePermissions from '../../hooks/usePermissions.js';
import { PERMISSIONS } from '../../config/permissions.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Button from '../../components/ui/Button.jsx';
import AdminSkeleton from '../../components/admin/AdminSkeleton.jsx';
import { formatAdminDate } from '../../utils/date.js';

export default function AdminLogs() {
  const auth = useAdminAuth();
  const { can } = usePermissions();
  const canViewAllLogs = can(PERMISSIONS.LOGS_VIEW_ALL);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ email: '', action: '', entityType: '', date: '' });

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAdminLogs({ ownOnly: !canViewAllLogs, email: auth.email });
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Chargement des logs impossible.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await listAdminLogs({ ownOnly: !canViewAllLogs, email: auth.email });
        if (mounted) setLogs(data);
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Chargement des logs impossible.');
          setLogs([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [auth.email, canViewAllLogs]);

  const filteredLogs = useMemo(() => logs.filter((log) => {
    const date = log.created_at ? new Date(log.created_at) : null;
    const createdDate = date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : '';
    return (!filters.email || String(log.admin_email || '').toLowerCase().includes(filters.email.toLowerCase()))
      && (!filters.action || String(log.action || '').toLowerCase().includes(filters.action.toLowerCase()))
      && (!filters.entityType || String(log.entity_type || '') === filters.entityType)
      && (!filters.date || createdDate === filters.date);
  }), [logs, filters]);

  const entityTypes = [...new Set(logs.map((log) => log.entity_type).filter(Boolean))];

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-navy dark:text-white">Logs d'Activité</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{logs.length} activité(s) chargée(s).</p>
        </div>
        <Button type="button" onClick={fetchLogs} variant="secondary"><RefreshCcw className="h-4 w-4" /> Actualiser</Button>
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-card-dark md:grid-cols-[1fr_1fr_180px_180px]">
        <label className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={filters.email} onChange={(event) => setFilters((current) => ({ ...current, email: event.target.value }))} placeholder="Admin email" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        </label>
        <input value={filters.action} onChange={(event) => setFilters((current) => ({ ...current, action: event.target.value }))} placeholder="Action" className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        <select value={filters.entityType} onChange={(event) => setFilters((current) => ({ ...current, entityType: event.target.value }))} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          <option value="">Toutes entités</option>
          {entityTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <input type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
      </div>

      {error && <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}

      {loading ? (
        <AdminSkeleton rows={7} />
      ) : (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-card-dark">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Admin</th>
                <th className="px-5 py-4">Action</th>
                <th className="px-5 py-4">Entité</th>
                <th className="px-5 py-4">Détails</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr><td colSpan="5" className="p-6"><EmptyState title="Aucune activité pour le moment." description="Les actions admin apparaîtront ici dès qu'elles seront enregistrées." /></td></tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {formatAdminDate(log.created_at)}
                    </td>
                    <td className="px-5 py-4 font-bold text-navy dark:text-white">{log.admin_email}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {log.entity_type} {log.entity_id ? `(#${log.entity_id.split('-')[0]})` : ''}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </AdminLayout>
  );
}
