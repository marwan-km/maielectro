import { HelpCircle, ShieldAlert, Key, LayoutDashboard } from 'lucide-react';
import AdminLayout from './AdminLayout.jsx';

export default function AdminHelp() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-black text-navy dark:text-white">Aide Administrateur</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Guide rapide d'utilisation du système d'administration.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-card-dark">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black text-navy dark:text-white">Rôles & Accès</h3>
          </div>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            <li><strong>Super Admin:</strong> Peut tout faire. Seul le super admin peut gérer les autres administrateurs, modifier les rôles et voir tous les logs.</li>
            <li><strong>Manager:</strong> Peut gérer les produits, les catégories, et le stock, mais ne peut pas supprimer un produit ni gérer l'équipe.</li>
            <li><strong>Éditeur:</strong> Peut créer/modifier des fiches produits, mais ne gère pas le stock.</li>
            <li><strong>Stock (Gestionnaire):</strong> Ne peut modifier QUE la disponibilité et la quantité en stock.</li>
            <li><strong>Spectateur:</strong> Accès en lecture seule au tableau de bord.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-card-dark">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
              <Key className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black text-navy dark:text-white">Mots de passe</h3>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Pour des raisons de sécurité, vous ne pouvez pas modifier directement le mot de passe d'un autre administrateur. 
            Vous devez utiliser le bouton <strong>"Réinitialiser"</strong> sur la page Administrateurs, qui enverra un email sécurisé à l'utilisateur concerné.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-card-dark">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black text-navy dark:text-white">Dépannage</h3>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
            <strong>Accès refusé ?</strong> Assurez-vous que votre compte est "Actif" (coche verte). Si vous n'arrivez pas à voir un bouton, c'est que votre rôle ne vous le permet pas.
          </p>
        </section>
        
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-card-dark">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black text-navy dark:text-white">Système d'Images</h3>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Les images téléchargées (principales et galerie) sont stockées dans le dossier <code>product-images</code> de Supabase Storage. Elles sont automatiquement optimisées par le CDN.
          </p>
        </section>
      </div>
    </AdminLayout>
  );
}
