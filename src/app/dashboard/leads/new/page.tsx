import { PageHeader } from '@/components/shared/page-header';
import { LeadForm } from '@/components/leads/lead-form';
import { Card, CardContent } from '@/components/ui/card';

export default function NewLeadPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Añadir Nuevo Prospecto"
        description="Completa los detalles para registrar un nuevo cliente potencial."
      />
      <Card>
        <CardContent className="pt-6">
          <LeadForm />
        </CardContent>
      </Card>
    </div>
  );
}
