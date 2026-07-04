import { Table } from '@heroui/react/table';

export default function AdminTable({ columns, children, emptyText = 'Aucune donnée.' }) {
  return (
    <Table.Root className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-card-dark">
      <Table.ScrollContainer className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
            <tr>
              {columns.map((column) => <th key={column} className="px-5 py-4 font-black tracking-wide">{column}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {children || <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-slate-500">{emptyText}</td></tr>}
          </tbody>
        </table>
      </Table.ScrollContainer>
    </Table.Root>
  );
}
