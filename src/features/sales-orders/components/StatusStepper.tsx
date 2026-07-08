import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { SalesOrderStatus } from '@/shared/types';
import { STATUS_LABELS, STATUS_SEQUENCE } from '../domain/status';

export function StatusStepper({ status }: { status: SalesOrderStatus }) {
  const currentIndex = STATUS_SEQUENCE.indexOf(status);

  return (
    <ol className="flex flex-wrap items-center gap-2">
      {STATUS_SEQUENCE.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step} className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium',
                isCurrent && 'bg-brand-600 text-white',
                isDone && 'bg-brand-100 text-brand-700',
                !isCurrent && !isDone && 'bg-slate-100 text-slate-400',
              )}
            >
              <span
                className={cn(
                  'flex size-4 items-center justify-center rounded-full text-[10px]',
                  isCurrent && 'bg-white/25',
                  isDone && 'bg-brand-600 text-white',
                  !isCurrent && !isDone && 'bg-slate-300 text-white',
                )}
              >
                {isDone ? <Check className="size-3" /> : index + 1}
              </span>
              {STATUS_LABELS[step]}
            </div>
            {index < STATUS_SEQUENCE.length - 1 ? (
              <span className="hidden h-px w-4 bg-slate-200 sm:block" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
