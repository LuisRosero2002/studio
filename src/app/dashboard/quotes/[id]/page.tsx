import { notFound } from "next/navigation";
import { quotes, leads, users } from "@/lib/data";
import { QuoteClientPage } from "@/components/quotes/quote-client-page";

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  const quote = quotes.find(q => q.id === params.id);
  if (!quote) {
    notFound();
  }

  const lead = leads.find(l => l.id === quote.leadId);
  if (!lead) {
    notFound();
  }
  
  const assignedUser = users.find(u => u.id === lead.assignedToId);

  return <QuoteClientPage quote={quote} lead={lead} user={assignedUser} />;
}
