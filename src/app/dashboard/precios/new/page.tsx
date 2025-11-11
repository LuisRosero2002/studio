import { PageHeader } from '@/components/shared/page-header';
import { PriceForm } from '@/components/prices/price-form';
import { Card, CardContent } from '@/components/ui/card';

export default function NewPriceItemPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Añadir Nuevo Ítem de Precio"
        description="Completa los detalles para crear un nuevo ítem en la lista de precios."
      />
      <Card>
        <CardContent className="pt-6">
          <PriceForm />
        </CardContent>
      </Card>
    </div>
  );
}
