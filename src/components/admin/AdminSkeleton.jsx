import { Skeleton } from '@heroui/react/skeleton';
import AppCard from '../ui/AppCard.jsx';

export default function AdminSkeleton({ rows = 5 }) {
  return (
    <AppCard className="p-4">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    </AppCard>
  );
}
