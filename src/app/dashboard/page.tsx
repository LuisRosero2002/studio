'use client';
import { PageHeader } from "@/components/shared/page-header";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { LeadSourceChart } from "@/components/dashboard/lead-source-chart";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
             <Skeleton className="lg:col-span-4 h-80" />
             <Skeleton className="lg:col-span-3 h-80" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Panel de Control"
        description="Aquí tienes un resumen del rendimiento de tus ventas."
      />
      <OverviewCards />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Resumen de Ventas</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Fuentes de Prospectos</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadSourceChart />
          </CardContent>
        </Card>
      </div>
      <RecentActivities />
    </div>
  );
}
