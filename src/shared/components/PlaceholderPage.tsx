import { Construction } from 'lucide-react';
import { PageHeader } from './PageHeader';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <Construction className="size-8 text-slate-400" />
        <p className="text-sm font-medium text-slate-600">
          Este módulo estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
