"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip, chartTooltipCursor } from "@/components/shared/recharts-tooltip";
import type { WinLossData } from "@/types";
import { useTradeModalStore } from "@/stores/trade-modal-store";

export function WinLossChart() {
  const [data, setData] = useState<WinLossData | null>(null);
  const refreshKey = useTradeModalStore((s) => s.refreshKey);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/analytics?metric=winLoss");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch win/loss data:", error);
      }
    }
    fetchData();
  }, [refreshKey]);

  if (!data) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const chartData = [
    { name: "Wins", value: data.wins, color: "#00C853" },
    { name: "Losses", value: data.losses, color: "#FF5252" },
    ...(data.breakeven > 0
      ? [{ name: "Breakeven", value: data.breakeven, color: "#94A3B8" }]
      : []),
  ];

  const total = data.wins + data.losses + data.breakeven;

  return (
    <div className="h-64 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={<ChartTooltip />}
            cursor={chartTooltipCursor}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
