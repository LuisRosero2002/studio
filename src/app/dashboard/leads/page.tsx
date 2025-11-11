import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { LeadsTable } from '@/components/leads/leads-table';

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Prospectos"
        description="Gestiona tus clientes potenciales y sigue su progreso."
      >
        <Button asChild>
          <Link href="/dashboard/leads/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Prospecto
          </Link>
        </Button>
      </PageHeader>
      
      <LeadsTable />
    </div>
  );
}
