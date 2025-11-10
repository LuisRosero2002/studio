import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { PricesTable } from '@/components/prices/prices-table';

export default function PricesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Gestión de Precios"
        description="Define, administra y actualiza los precios de los componentes de tus soluciones."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Precio
        </Button>
      </PageHeader>
      
      <PricesTable />
    </div>
  );
}
