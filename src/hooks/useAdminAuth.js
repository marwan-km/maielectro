import { useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { isAllowedSuperAdminEmail, SUPER_ADMIN_EMAIL } from '../config/admin.js';
import { getAdminProfileByEmail } from '../services/adminService.js';
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
      if (!isAllowedSuperAdminEmail(loggedInEmail)) {
        setError(`Accès refusé pour: ${loggedInEmail || 'email inconnu'}. Seul le super admin est autorisé.`);
        setAdmin(null);
        setLoading(false);
        return;
      }

      const profile = await getAdminProfileByEmail(loggedInEmail);
      if (!profile) {
        setError(`Accès refusé pour: ${loggedInEmail || 'email inconnu'}. Seul le super admin est autorisé. Vérifiez public.admin_users: ${SUPER_ADMIN_EMAIL}, role super_admin, active true.`);
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
    isAdmin: Boolean(admin?.active),
    isSuperAdmin: admin?.role === 'super_admin' && isAllowedSuperAdminEmail(admin?.email),
    email: session?.user?.email || '',
    logout: async () => {
      if (supabase) await supabase.auth.signOut();
      window.location.href = '/admin';
    },
  }), [session, admin, loading, error]);

  return value;
}
