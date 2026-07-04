import { Navigate } from 'react-router-dom';
import useAdminAuth from '../../hooks/useAdminAuth.js';
import AdminLogin from '../../pages/admin/AdminLogin.jsx';
import Button from '../ui/Button.jsx';

export default function AdminRoute({ children, superAdminOnly = false }) {
  const auth = useAdminAuth();

  if (auth.loading) {
    return <div className="grid min-h-screen place-items-center bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-white">Chargement...</div>;
  }

  if (!auth.isConfigured || !auth.session) {
    return <AdminLogin initialError={auth.error} />;
  }

  if (!auth.isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-gray-100 p-4 dark:bg-gray-950">
        <section className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Accès refusé</h1>
          <p className="mt-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700 dark:bg-red-950/30 dark:text-red-300">
            {auth.error || `Accès refusé pour: ${auth.email || 'email inconnu'}.`}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={() => window.location.reload()}>Réessayer</Button>
            <button type="button" onClick={auth.logout} className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              Déconnexion
            </button>
          </div>
        </section>
      </main>
    );

  }

  if (superAdminOnly && !auth.isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
