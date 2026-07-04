import { useEffect, useState } from 'react';
import { Button as HeroButton } from '@heroui/react/button';
import { Card } from '@heroui/react/card';
import { Chip } from '@heroui/react/chip';
import { Input } from '@heroui/react/input';
import { Switch } from '@heroui/react/switch';
import { Edit, Mail, Plus, Power, Trash2, X } from 'lucide-react';
import AdminLayout from './AdminLayout.jsx';
import RoleBadge from '../../components/admin/RoleBadge.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import AdminSkeleton from '../../components/admin/AdminSkeleton.jsx';
import useAdminAuth from '../../hooks/useAdminAuth.js';
import { getAdmins, createAdmin, updateAdmin, deactivateAdmin, deleteAdmin, sendPasswordReset } from '../../services/adminUserService.js';
import { formatAdminDateOnly } from '../../utils/date.js';

const roles = [
  ['super_admin', 'Super Admin'],
  ['admin', 'Admin'],
  ['manager', 'Manager'],
  ['editor', 'Éditeur'],
  ['stock_manager', 'Gestionnaire de stock'],
  ['viewer', 'Viewer'],
];

export default function AdminUsers() {
  const auth = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  
  const initialForm = { email: '', fullName: '', role: 'viewer', active: true };
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdmins({ includeInactive: showInactive });
      setAdmins(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [showInactive]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (editingAdmin) {
        await updateAdmin(editingAdmin.id, form, auth.email);
        setMessage('Administrateur mis à jour.');
      } else {
        await createAdmin(form, auth.email);
        try {
          await sendPasswordReset(form.email, auth.email);
          setMessage('Administrateur créé. Email de réinitialisation envoyé.');
        } catch (resetError) {
          setMessage('Administrateur créé. Le reset email doit être envoyé depuis Supabase Auth ou Edge Function.');
        }
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setError(err.message || 'Action impossible.');
    }
  };

  const requestDeactivate = (admin) => {
    if (admin.email === auth.email || admin.role === 'super_admin') {
      setError('Le super admin connecté ne peut pas être désactivé depuis cette page.');
      return;
    }
    setConfirmAction({ type: 'deactivate', admin });
  };

  const requestDelete = (admin) => {
    if (admin.email === auth.email || admin.role === 'super_admin') {
      setError('Le super admin connecté ne peut pas être supprimé.');
      return;
    }
    setConfirmAction({ type: 'delete', admin });
  };

  const runConfirmedAction = async () => {
    if (!confirmAction) return;
    const target = confirmAction.admin;
    try {
      if (confirmAction.type === 'delete') {
        await deleteAdmin(target.id, auth.email);
        setMessage('Administrateur supprimé définitivement.');
      } else {
        await deactivateAdmin(target.id, auth.email);
        setMessage('Administrateur désactivé.');
      }
      setConfirmAction(null);
      await load();
    } catch (err) {
      setError(err.message || 'Action impossible.');
    }
  };

  const handleReset = async (email) => {
    try {
      await sendPasswordReset(email, auth.email);
      setMessage('Email envoyé avec succès.');
    } catch (err) {
      setError(`${err.message}. Si Supabase refuse l'action depuis le navigateur, utilisez l'Edge Function admin-user-actions ou le dashboard Supabase Auth.`);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-navy dark:text-white">Administrateurs</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gérez les accès et les rôles de votre équipe.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-soft dark:border-slate-800 dark:bg-card-dark dark:text-slate-200">
            <Switch isSelected={showInactive} onValueChange={setShowInactive} size="sm" color="primary" aria-label="Afficher les inactifs" />
            Afficher les inactifs
          </label>
          <Button onClick={() => { setEditingAdmin(null); setForm(initialForm); setShowModal(true); }}>
            <Plus className="h-5 w-5" /> Nouvel Admin
          </Button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
      {message && <p className="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{message}</p>}

      {loading ? (
        <AdminSkeleton rows={6} />
      ) : (
      <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-card-dark">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">Utilisateur</th>
                <th className="px-5 py-4">Rôle</th>
                <th className="px-5 py-4">Statut</th>
                <th className="px-5 py-4">Créé le</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 && <tr><td colSpan="5" className="px-5 py-8 text-center text-slate-500">Aucun administrateur trouvé.</td></tr>}
              {admins.map((admin) => (
                <tr key={admin.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-5 py-4">
                    <div className="font-bold text-navy dark:text-white">{admin.full_name || 'Sans nom'}</div>
                    <div className="max-w-xs truncate text-slate-500">{admin.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <RoleBadge role={admin.role} />
                  </td>
                  <td className="px-5 py-4">
                    {admin.active ? (
                      <Chip color="success" variant="flat" radius="full" size="sm" className="font-black">Actif</Chip>
                    ) : (
                      <Chip color="danger" variant="flat" radius="full" size="sm" className="font-black">Inactif</Chip>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {formatAdminDateOnly(admin.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <HeroButton isIconOnly onPress={() => handleReset(admin.email)} title="Réinitialiser mot de passe" variant="bordered" radius="lg" className="border-slate-200 text-slate-500 dark:border-slate-700">
                        <Mail className="h-4 w-4" />
                      </HeroButton>
                      <HeroButton isIconOnly onPress={() => { setEditingAdmin(admin); setForm({ email: admin.email, fullName: admin.full_name || '', role: admin.role, active: admin.active, permissions: admin.permissions || {} }); setShowModal(true); }} variant="bordered" radius="lg" className="border-slate-200 text-slate-500 dark:border-slate-700">
                        <Edit className="h-4 w-4" />
                      </HeroButton>
                      {admin.active && (
                        <HeroButton isIconOnly onPress={() => requestDeactivate(admin)} title="Désactiver" variant="bordered" radius="lg" color="warning">
                          <Power className="h-4 w-4" />
                        </HeroButton>
                      )}
                      {!admin.active && (
                        <HeroButton isIconOnly onPress={() => requestDelete(admin)} title="Supprimer définitivement" variant="bordered" radius="lg" color="danger">
                          <Trash2 className="h-4 w-4" />
                        </HeroButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-card-dark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black">{editingAdmin ? 'Modifier Admin' : 'Nouvel Admin'}</h3>
              <HeroButton type="button" isIconOnly onPress={() => setShowModal(false)} variant="flat" radius="lg"><X className="h-4 w-4" /></HeroButton>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingAdmin && (
                <label className="block">
                  <span className="mb-1 block text-sm font-bold">Email</span>
                  <Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} radius="lg" variant="bordered" />
                </label>
              )}
              <label className="block">
                <span className="mb-1 block text-sm font-bold">Nom complet</span>
                <Input type="text" required value={form.fullName || ''} onChange={e => setForm({ ...form, fullName: e.target.value })} radius="lg" variant="bordered" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-bold">Rôle</span>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="h-11 w-full rounded-xl border px-3 dark:border-slate-700 dark:bg-slate-800">
                  {roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <Switch isSelected={Boolean(form.active)} onValueChange={active => setForm({ ...form, active })} size="sm" color="primary" aria-label="Compte actif" />
                <span className="font-bold">Compte actif</span>
              </label>
              
              <div className="mt-6 flex justify-end gap-3">
                <HeroButton type="button" onPress={() => setShowModal(false)} variant="light" radius="lg" className="font-bold">Annuler</HeroButton>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
      {confirmAction && (
        <ConfirmDialog
          danger={confirmAction.type === 'delete'}
          title={confirmAction.type === 'delete' ? 'Supprimer définitivement ?' : 'Désactiver cet admin ?'}
          description={confirmAction.type === 'delete'
            ? `Cette action supprimera définitivement ${confirmAction.admin.email}.`
            : `${confirmAction.admin.email} ne pourra plus accéder à l'administration.`}
          confirmLabel={confirmAction.type === 'delete' ? 'Supprimer' : 'Désactiver'}
          onCancel={() => setConfirmAction(null)}
          onConfirm={runConfirmedAction}
        />
      )}
    </AdminLayout>
  );
}
