import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import BrandLogo from '../../components/ui/BrandLogo.jsx';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient.js';
import { getAdminProfileBySession } from '../../services/adminService.js';

export default function AdminLogin({ initialError = '' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session) {
    return <Navigate to="/admin" replace />;
  }

  const signInWithPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const normalizedEmail = email.trim().toLowerCase();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (authError) throw authError;
      const loggedInEmail = data.user?.email || normalizedEmail;
      const profile = await getAdminProfileBySession(data.session);
      if (!profile) {
        await supabase.auth.signOut();
        setSession(null);
        setError(`Accès refusé pour: ${loggedInEmail}. Ce compte n'est pas un administrateur actif autorisé.`);
      } else if (data.session) {
        setSession(data.session);
      }
    } catch (err) {
      setError(err.message || 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) throw new Error('Saisissez votre email administrateur.');

      const redirectTo = `${window.location.origin}/admin/reset-password`;
      const { error: authError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo,
      });
      if (authError) throw authError;
      setMessage('Lien de réinitialisation envoyé. Vérifiez votre email.');
    } catch (err) {
      setError(err.message || 'Envoi du lien impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-premium dark:border-slate-800 dark:bg-card-dark">
        <div className="mb-6 flex items-center justify-between gap-4">
          <BrandLogo size="lg" />
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-navy dark:text-white">Administration MaiElectro</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Accès réservé aux administrateurs autorisés.</p>

        {!isSupabaseConfigured && (
          <div className="mt-6 rounded-2xl bg-gray-100 p-4 text-sm font-semibold text-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
            Supabase n’est pas configuré. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans votre fichier .env.
          </div>
        )}

        <form onSubmit={signInWithPassword} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Email</span>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-ink outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Mot de passe</span>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-ink outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            </div>
          </label>

          {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
          {message && <p className="rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700 dark:bg-green-950/30 dark:text-green-300">{message}</p>}

          <Button type="submit" disabled={!isSupabaseConfigured || loading} className="w-full">{loading ? 'Connexion...' : 'Connexion'}</Button>
          <button type="button" onClick={sendPasswordReset} disabled={!isSupabaseConfigured || !email || loading} className="w-full rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            Mot de passe oublié
          </button>
        </form>
      </section>
    </main>
  );
}
