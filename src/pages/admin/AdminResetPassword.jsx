import { useEffect, useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient.js';

export default function AdminResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Validation du lien de récupération...');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadRecoverySession = async () => {
      if (!isSupabaseConfigured) {
        setStatus('error');
        setError('Supabase n’est pas configuré. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans votre fichier .env.');
        return;
      }

      try {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const hashError = hashParams.get('error_description') || hashParams.get('error');
        if (hashError) throw new Error(hashError);

        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;

          window.history.replaceState(null, document.title, window.location.pathname);
          setStatus('ready');
          setMessage('Lien validé. Choisissez un nouveau mot de passe.');
          return;
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!data.session) throw new Error('Lien de récupération manquant ou expiré. Demandez un nouveau lien de réinitialisation.');

        setStatus('ready');
        setMessage('Session active. Choisissez un nouveau mot de passe.');
      } catch (err) {
        setStatus('error');
        setError(err.message || 'Impossible de valider le lien de récupération.');
      }
    };

    loadRecoverySession();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      setSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setSubmitting(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setStatus('success');
      setMessage('Mot de passe mis à jour. Redirection vers l’administration...');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1800);
    } catch (err) {
      setError(err.message || 'Mise à jour du mot de passe impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-premium dark:border-slate-800 dark:bg-card-dark">
        <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-black text-navy dark:text-white">Nouveau mot de passe</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Définissez un nouveau mot de passe administrateur.</p>

        {status === 'loading' && (
          <p className="mt-6 rounded-2xl bg-gray-100 p-3 text-sm font-semibold text-gray-700 dark:bg-gray-700/50 dark:text-gray-300">{message}</p>
        )}

        {error && (
          <p className="mt-6 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>
        )}

        {status === 'success' && (
          <p className="mt-6 rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700 dark:bg-green-950/30 dark:text-green-300">{message}</p>
        )}

        {status === 'ready' && (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {message && <p className="rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700 dark:bg-green-950/30 dark:text-green-300">{message}</p>}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Nouveau mot de passe</span>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required minLength={8} className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-ink outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Confirmer le mot de passe</span>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" required minLength={8} className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-ink outline-none focus:border-electric dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
            </label>
            <Button type="submit" disabled={submitting} className="w-full">{submitting ? 'Mise à jour...' : 'Mettre à jour'}</Button>
          </form>
        )}
      </section>
    </main>
  );
}
