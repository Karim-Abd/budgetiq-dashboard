"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";

export interface TrendSeries {
  key: string;
  name: string;
  color: string;
}

interface TrendChartProps {
  // chart rows — loosely typed since callers pass various computed shapes
  data: any[];
  xKey: string;
  series: TrendSeries[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  yWidth?: number;
}

// Green/blue duotone area chart used for revenue/cost/MRR/P&L trends.
export function TrendChart({
  data,
  xKey,
  series,
  height = 260,
  valuePrefix = "",
  valueSuffix = "",
  yWidth = 44,
}: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 15% 14%)" vertical={false} />
        <XAxis
          dataKey={xKey}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(216 10% 58%)", fontSize: 11, fontFamily: "var(--font-mono)" }}
          dy={6}
        />
        <YAxis
          width={yWidth}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(216 10% 58%)", fontSize: 11, fontFamily: "var(--font-mono)" }}
          tickFormatter={(v) =>
            `${valuePrefix}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}${valueSuffix}`
          }
        />
        <Tooltip
          content={<ChartTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />}
          cursor={{ stroke: "hsl(214 15% 24%)", strokeWidth: 1 }}
        />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
