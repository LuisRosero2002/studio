"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"

import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

const data = [
  { source: "Website", value: 275, fill: "var(--color-website)" },
  { source: "Referral", value: 200, fill: "var(--color-referral)" },
  { source: "Cold Call", value: 187, fill: "var(--color-coldcall)" },
  { source: "Advertisement", value: 173, fill: "var(--color-ads)" },
  { source: "Other", value: 90, fill: "var(--color-other)" },
]

const chartConfig = {
  value: {
    label: "Leads",
  },
  website: {
    label: "Website",
    color: "hsl(var(--chart-1))",
  },
  referral: {
    label: "Referral",
    color: "hsl(var(--chart-2))",
  },
  coldcall: {
    label: "Cold Call",
    color: "hsl(var(--chart-3))",
  },
  ads: {
    label: "Advertisement",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
}

export function LeadSourceChart() {
  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="source"
            innerRadius={60}
            strokeWidth={5}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <ChartLegend
            content={<ChartLegendContent nameKey="source" />}
            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
