import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, CircleSlash } from 'lucide-react';

const metrics = [
  { title: "Ventas Totales", value: "$45,231.89", change: "+20.1% desde el mes pasado", icon: DollarSign },
  { title: "Prospectos Activos", value: "23", change: "+5 desde el mes pasado", icon: Users },
  { title: "Tasa de Conversión", value: "12.5%", change: "+1.2% desde el mes pasado", icon: TrendingUp },
  { title: "Prospectos Perdidos", value: "4", change: "-2 desde el mes pasado", icon: CircleSlash },
];

export function OverviewCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
