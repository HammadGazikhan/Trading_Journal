"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SetupPerformance } from "@/types";
import { formatSetup } from "@/lib/utils";
import { ChartTooltip, chartTooltipCursor } from "@/components/shared/recharts-tooltip";
import { useTradeModalStore } from "@/stores/trade-modal-store";

export function SetupPerformanceChart() {
  const [data, setData] = useState<SetupPerformance[]>([]);
  const refreshKey = useTradeModalStore((s) => s.refreshKey);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/analytics?metric=setupPerformance");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch setup performance:", error);
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

  const chartData = data.map((item) => ({
    ...item,
    setup: formatSetup(item.setup),
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            type="category"
            dataKey="setup"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            width={100}
          />
          <Tooltip
            content={
              <ChartTooltip
                formatter={(value, _name, dataKey) =>
                  dataKey === "winRate"
                    ? [`${value.toFixed(1)}%`, "Win Rate"]
                    : [String(value), "Value"]
                }
              />
            }
            cursor={chartTooltipCursor}
          />
          <Bar
            dataKey="winRate"
            fill="#00E5FF"
            radius={[0, 4, 4, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
