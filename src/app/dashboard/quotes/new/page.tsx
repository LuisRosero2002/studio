import { PageHeader } from "@/components/shared/page-header";
import { QuoteForm } from "@/components/quotes/quote-form";

export default function NewQuotePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Crear Nueva Cotización"
        description="Completa los detalles para generar una nueva cotización para el cliente."
      />
      <QuoteForm />
    </div>
  );
}
