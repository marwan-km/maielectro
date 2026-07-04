import { useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { getAdminProfileBySession } from '../services/adminService.js';
import { addAdminLog } from '../services/logService.js';

export default function useAdminAuth() {
  const [session, setSession] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdmin = async (nextSession) => {
    if (!isSupabaseConfigured || !nextSession) {
      setAdmin(null);
      setLoading(false);
      return;
    }
    try {
      const loggedInEmail = nextSession.user?.email || '';
      const profile = await getAdminProfileBySession(nextSession);
      if (!profile) {
        setError(`Accès refusé pour: ${loggedInEmail || 'email inconnu'}. Ce compte n'est pas un administrateur actif autorisé.`);
        setAdmin(null);
      } else {
        setAdmin(profile);
        setError('');
      }
    } catch (err) {
      const loggedInEmail = nextSession?.user?.email || 'email inconnu';
      setError(`Vérification admin impossible pour ${loggedInEmail}: ${err.message || 'erreur inconnue'}. Vérifiez la table public.admin_users, les politiques RLS et la configuration Supabase.`);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadAdmin(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      setSession(nextSession);
      if (event === 'SIGNED_IN' && nextSession?.user?.email) {
        try {
          await addAdminLog({ adminEmail: nextSession.user.email, action: 'login success', entityType: 'auth', entityId: nextSession.user.id });
        } catch {}
      }
      await loadAdmin(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({
    session,
    admin,
    loading,
    error,
    isConfigured: isSupabaseConfigured,
    isAdmin: Boolean(admin) && (admin.is_active ?? admin.active ?? true),
    isSuperAdmin: admin?.role === 'super_admin' && (admin.is_active ?? admin.active ?? true),
    email: session?.user?.email || '',
    logout: async () => {
      if (supabase) await supabase.auth.signOut();
      window.location.href = '/admin';
    },
  }), [session, admin, loading, error]);

  return value;
}
