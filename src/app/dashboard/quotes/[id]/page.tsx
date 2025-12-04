import { notFound } from "next/navigation";
import { quotes, leads, users } from "@/lib/data";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const QuoteClientPage = dynamic(() => import('@/components/quotes/quote-client-page').then(mod => mod.QuoteClientPage), { 
  ssr: false,
  loading: () => <div className="space-y-4">
    <Skeleton className="h-10 w-1/4" />
    <div className="grid grid-cols-5 gap-6">
      <div className="col-span-2 space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="col-span-3">
        <Skeleton className="h-[80vh] w-full" />
      </div>
    </div>
  </div>
});

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
