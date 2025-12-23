'use client';
import { PageHeader } from "@/components/shared/page-header";
import { useFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="grid gap-1">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-72" />
            </div>
        </div>
         <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Panel de Control"
        description="Bienvenido a tu centro de ventas."
      />
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Dashboard Vacío
          </h3>
          <p className="text-sm text-muted-foreground">
            Puedes empezar a construir tu dashboard aquí.
          </p>
        </div>
      </div>
    </div>
  );
}
