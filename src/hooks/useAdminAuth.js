import { useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { getAdminProfileBySession } from '../services/adminService.js';
import { addAdminLog } from '../services/logService.js';

const authState = {
  session: null,
  admin: null,
  loading: true,
  error: '',
};

const listeners = new Set();
let initialized = false;
let subscription = null;
let loadId = 0;

const notify = () => {
  const snapshot = { ...authState };
  listeners.forEach((listener) => listener(snapshot));
};

const setAuthState = (patch) => {
  Object.assign(authState, patch);
  notify();
};

const loadAdmin = async (nextSession, { clearOnMissingSession = true } = {}) => {
  const currentLoadId = ++loadId;

  if (!isSupabaseConfigured || !nextSession) {
    setAuthState({
      session: nextSession || null,
      admin: clearOnMissingSession ? null : authState.admin,
      loading: false,
      error: '',
    });
    return;
  }

  setAuthState({ session: nextSession, loading: true });

  try {
    const loggedInEmail = nextSession.user?.email || '';
    const profile = await getAdminProfileBySession(nextSession);
    if (currentLoadId !== loadId) return;

    if (!profile) {
      setAuthState({
        admin: authState.admin,
        loading: false,
        error: authState.admin ? '' : `Accès refusé pour: ${loggedInEmail || 'email inconnu'}. Ce compte n'est pas un administrateur actif autorisé.`,
      });
      return;
    }

    setAuthState({ admin: profile, loading: false, error: '' });
  } catch (err) {
    if (currentLoadId !== loadId) return;
    const loggedInEmail = nextSession?.user?.email || 'email inconnu';
    setAuthState({
      admin: authState.admin,
      loading: false,
      error: authState.admin ? '' : `Vérification admin impossible pour ${loggedInEmail}: ${err.message || 'erreur inconnue'}. Vérifiez la table public.admin_users, les politiques RLS et la configuration Supabase.`,
    });
  }
};

const initAuthStore = () => {
  if (initialized) return;
  initialized = true;

  if (!isSupabaseConfigured) {
    setAuthState({ loading: false });
    return;
  }

  supabase.auth.getSession().then(({ data }) => {
    loadAdmin(data.session);
  }).catch((err) => {
    setAuthState({ loading: false, error: err.message || 'Session admin introuvable.' });
  });

  const { data: listener } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
    if (event === 'SIGNED_OUT') {
      await loadAdmin(null);
      return;
    }

    if (event === 'SIGNED_IN' && nextSession?.user?.email) {
      try {
        await addAdminLog({ adminEmail: nextSession.user.email, action: 'login success', entityType: 'auth', entityId: nextSession.user.id });
      } catch {}
    }

    await loadAdmin(nextSession, { clearOnMissingSession: event === 'SIGNED_OUT' });
  });

  subscription = listener.subscription;
};

export default function useAdminAuth() {
  const [state, setState] = useState({ ...authState });

  useEffect(() => {
    initAuthStore();
    listeners.add(setState);
    setState({ ...authState });

    return () => {
      listeners.delete(setState);
    };
  }, []);

  const value = useMemo(() => ({
    session: state.session,
    admin: state.admin,
    loading: state.loading,
    error: state.error,
    isConfigured: isSupabaseConfigured,
    isAdmin: Boolean(state.admin) && state.admin.active === true,
    isSuperAdmin: String(state.admin?.role || '').trim().toLowerCase() === 'super_admin' && state.admin.active === true,
    email: state.session?.user?.email || '',
    logout: async () => {
      if (supabase) await supabase.auth.signOut();
      subscription?.unsubscribe?.();
      subscription = null;
      initialized = false;
      setAuthState({ session: null, admin: null, loading: false, error: '' });
      window.location.href = '/admin';
    },
  }), [state]);

  return value;
}
