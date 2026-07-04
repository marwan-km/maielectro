import { Card } from '@heroui/react/card';

export default function AdminStatCard({ title, value, icon: Icon, tone = 'gray' }) {
  const tones = {
    gray:  'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    blue:  'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400',
    amber: 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400',
    red:   'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <Card className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone] || tones.gray}`}>
        {Icon && <Icon className="h-5 w-5" />}
      </div>
      <p className="mt-5 text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{value}</p>
    </Card>
  );
}
