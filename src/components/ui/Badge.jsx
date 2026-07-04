export default function Badge({ children, className = '', variant = 'default' }) {
  if (!children) return null;
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    danger:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    promo:   'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
    info:    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
