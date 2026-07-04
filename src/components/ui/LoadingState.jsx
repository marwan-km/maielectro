import { Skeleton } from '@heroui/react/skeleton';
import AppCard from './AppCard.jsx';

export default function LoadingState({ rows = 3, className = '' }) {
  return (
    <AppCard className={`p-4 ${className}`}>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    </AppCard>
  );
}
