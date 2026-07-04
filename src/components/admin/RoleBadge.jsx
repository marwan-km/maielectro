export default function RoleBadge({ role }) {
  const roleStyles = {
    super_admin:   'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 border-gray-800 dark:border-gray-200',
    admin:         'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800 border-gray-700 dark:border-gray-300',
    manager:       'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
    editor:        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600',
    stock_manager: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600',
    viewer:        'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  };

  const labels = {
    super_admin:   'Super Admin',
    admin:         'Admin',
    manager:       'Manager',
    editor:        'Éditeur',
    stock_manager: 'Stock',
    viewer:        'Spectateur',
  };

  const style = roleStyles[role] || roleStyles.viewer;
  const label = labels[role] || role;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${style}`}>
      {label}
    </span>
  );
}
