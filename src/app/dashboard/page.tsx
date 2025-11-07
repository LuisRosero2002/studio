import { PageHeader } from "@/components/shared/page-header";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { LeadSourceChart } from "@/components/dashboard/lead-source-chart";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
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
