import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { QuotesTable } from '@/components/quotes/quotes-table';

export default function QuotesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cotizaciones"
        description="Crea y gestiona las cotizaciones de tus clientes."
      >
        <Button asChild>
          <Link href="/dashboard/quotes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Cotización
          </Link>
        </Button>
      </PageHeader>
      
      <QuotesTable />
    </div>
  );
}
