"use client";

import { useEffect, useMemo, useState } from "react";
import { useTradeModalStore } from "@/stores/trade-modal-store";
import { getDayOfWeekShort } from "@/lib/calculations/day-of-week";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import type { DayPerformance } from "@/types";

function getHeatColor(day: DayPerformance, maxAbsPnl: number) {
  if (day.trades === 0) return "rgba(148, 163, 184, 0.08)";

  const intensity = Math.max(0.2, Math.min(Math.abs(day.pnl) / maxAbsPnl, 1));
  if (day.pnl >= 0) {
    return `rgba(0, 200, 83, ${0.15 + intensity * 0.45})`;
  }

  return `rgba(255, 82, 82, ${0.15 + intensity * 0.45})`;
}

function formatCompactPnl(value: number) {
  return formatCurrency(value, {
    notation: "compact",
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });
}

export function PerformanceByDayHeatmap() {
  const [data, setData] = useState<DayPerformance[]>([]);
  const refreshKey = useTradeModalStore((s) => s.refreshKey);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/analytics?metric=dayPerformance");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch day performance:", error);
      }
    }

    fetchData();
  }, [refreshKey]);

  const summary = useMemo(() => {
    if (data.length === 0) return null;

    const activeDays = data.filter((day) => day.trades > 0);
    if (activeDays.length === 0) return null;

    const bestDay = activeDays.reduce((best, current) =>
      current.pnl > best.pnl ? current : best
    );
    const toughestDay = activeDays.reduce((worst, current) =>
      current.pnl < worst.pnl ? current : worst
    );

    return { bestDay, toughestDay };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const maxAbsPnl = Math.max(...data.map((day) => Math.abs(day.pnl)), 1);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="grid min-w-[360px] grid-cols-7 gap-1.5">
          {data.map((day) => {
            const hasTrades = day.trades > 0;

            return (
              <div
                key={day.day}
                className={cn(
                  "flex min-w-0 flex-col items-center rounded-lg border border-white/5 px-1.5 py-2.5 text-center transition-transform duration-200",
                  hasTrades && "hover:-translate-y-0.5"
                )}
                style={{ backgroundColor: getHeatColor(day, maxAbsPnl) }}
              >
                <p className="w-full truncate text-[11px] font-semibold text-foreground">
                  {getDayOfWeekShort(day.day)}
                </p>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {day.trades} {day.trades === 1 ? "trade" : "trades"}
                </p>

                {hasTrades ? (
                  <>
                    <span className="mt-1.5 inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium bg-black/20 text-foreground/90">
                      {formatPercent(day.winRate)}
                    </span>
                    <p
                      className={cn(
                        "mt-1.5 w-full truncate text-xs font-semibold font-mono leading-none",
                        day.pnl >= 0 ? "text-success" : "text-destructive"
                      )}
                      title={formatCurrency(day.pnl)}
                    >
                      {formatCompactPnl(day.pnl)}
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-[10px] text-muted-foreground">—</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-success/20 bg-success/10 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-success/80">
              Best Day
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {summary.bestDay.day}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCompactPnl(summary.bestDay.pnl)} · {summary.bestDay.trades} trades
            </p>
          </div>
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-destructive/80">
              Needs Attention
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {summary.toughestDay.day}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCompactPnl(summary.toughestDay.pnl)} · {summary.toughestDay.trades} trades
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
