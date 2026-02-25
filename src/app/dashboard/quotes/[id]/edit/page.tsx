'use client';

import { useParams, notFound } from "next/navigation";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Quote } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { QuoteForm } from "@/components/quotes/quote-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function EditQuotePage() {
  const params = useParams();
  const quoteId = params.id as string;
  const { firestore } = useFirebase();

  const quoteDocRef = useMemoFirebase(() => {
    if (!quoteId || !firestore) return null;
    return doc(firestore, 'quotes', quoteId);
  }, [firestore, quoteId]);

  const { data: quote, isLoading } = useDoc<Quote>(quoteDocRef);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!isLoading && !quote) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/quotes/${quoteId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>
      <PageHeader
        title={`Editar Cotización #${quote!.quoteNumber}`}
        description="Modifica los equipos, servicios o términos de la cotización."
      />
      <QuoteForm initialData={quote!} />
    </div>
  );
}
