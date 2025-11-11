import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { PricesTable } from '@/components/prices/prices-table';
import { priceItems } from '@/lib/data';

export default function PricesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Gestión de Precios"
        description="Define, administra y actualiza los precios de los componentes de tus soluciones."
      >
        <Button asChild>
          <Link href="/dashboard/precios/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Precio
          </Link>
        </Button>
      </PageHeader>
      
      <PricesTable items={priceItems} />
    </div>
  );
}
