"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DailyPnL } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useTradeModalStore } from "@/stores/trade-modal-store";

function DailyPnLTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const pnl = Number(payload[0].value);

  return (
    <div className="rounded-lg border border-white/10 bg-[#111827] px-3 py-2 shadow-xl">
      <p className="mb-1 text-sm text-[#94A3B8]">{label}</p>
      <p
        className={`text-sm font-semibold ${
          pnl >= 0 ? "text-[#00C853]" : "text-[#FF5252]"
        }`}
      >
        P&L: {formatCurrency(pnl)}
      </p>
    </div>
  );
}

export function DailyPnLChart() {
  const [data, setData] = useState<DailyPnL[]>([]);
  const refreshKey = useTradeModalStore((s) => s.refreshKey);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/analytics?metric=dailyPnl");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch daily P&L:", error);
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
        <BarChart data={data}>
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
            content={<DailyPnLTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />
          <Bar dataKey="pnl" radius={[4, 4, 0, 0]} animationDuration={1000}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.pnl >= 0 ? "#00C853" : "#FF5252"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
