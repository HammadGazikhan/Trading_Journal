"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { EquityCurvePoint } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  ChartTooltip,
  chartTooltipCursor,
} from "@/components/shared/recharts-tooltip";
import { useTradeModalStore } from "@/stores/trade-modal-store";

export function EquityCurveChart() {
  const [data, setData] = useState<EquityCurvePoint[]>([]);
  const refreshKey = useTradeModalStore((s) => s.refreshKey);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/analytics?metric=equityCurve");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch equity curve:", error);
      }
    }
    fetchData();
  }, [refreshKey]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            tickFormatter={(value) =>
              formatCurrency(value, { notation: "compact" })
            }
          />
          <Tooltip
            content={
              <ChartTooltip
                formatter={(value) => [formatCurrency(value), "Equity"]}
              />
            }
            cursor={chartTooltipCursor}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke="#00E5FF"
            strokeWidth={2}
            fill="url(#equityGradient)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
