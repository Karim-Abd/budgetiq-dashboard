"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";

// Green/blue duotone palette stepped across categories.
const PALETTE = [
  "hsl(158 64% 52%)",
  "hsl(198 90% 60%)",
  "hsl(217 91% 60%)",
  "hsl(158 50% 40%)",
  "hsl(217 60% 48%)",
  "hsl(216 12% 40%)",
];

interface CategoryDonutProps {
  data: { category: string; amount: number }[];
  height?: number;
  valuePrefix?: string;
}

export function CategoryDonut({ data, height = 200, valuePrefix = "$" }: CategoryDonutProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          innerRadius="58%"
          outerRadius="86%"
          paddingAngle={2}
          stroke="hsl(220 13% 5%)"
          strokeWidth={2}
          isAnimationActive={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip valuePrefix={valuePrefix} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export const donutPalette = PALETTE;
