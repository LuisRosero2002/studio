import { PageHeader } from "@/components/shared/page-header";
import { QuoteForm } from "@/components/quotes/quote-form";

export default function NewQuotePage() {
  return (
    <div>
      <PageHeader
        title="Create New Quote"
        description="Fill in the details to generate a new customer quote."
      />
      <QuoteForm />
    </div>
  );
}
