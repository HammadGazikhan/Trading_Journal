"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, formatCurrency, formatSetup, formatRR } from "@/lib/utils";
import {
  DirectionBadge,
  GradeBadge,
  PnLBadge,
} from "@/components/shared/badge";
import { useTradeModalStore } from "@/stores/trade-modal-store";
import type { TradeWithMistakes } from "@/types";

export function RecentTradesTable() {
  const [trades, setTrades] = useState<TradeWithMistakes[]>([]);
  const refreshKey = useTradeModalStore((s) => s.refreshKey);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/trades?limit=5");
        if (response.ok) {
          const result = await response.json();
          setTrades(result.trades || []);
        }
      } catch (error) {
        console.error("Failed to fetch recent trades:", error);
      }
    }
    fetchData();
  }, [refreshKey]);

  if (trades.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No recent trades
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Date
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Instrument
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Direction
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Setup
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
              P&L
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
              RR
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
              Grade
            </th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr
              key={trade.id}
              className="border-b border-border hover:bg-secondary/50 transition-colors"
            >
              <td className="px-4 py-3 text-sm">
                <Link
                  href={`/journal/${trade.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {formatDate(trade.date)}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm font-medium">
                {trade.instrument}
              </td>
              <td className="px-4 py-3">
                <DirectionBadge direction={trade.direction} />
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatSetup(trade.setup)}
              </td>
              <td className="px-4 py-3 text-right">
                <PnLBadge value={Number(trade.pnl)} />
              </td>
              <td className="px-4 py-3 text-right text-sm font-mono">
                {formatRR(trade.rrRatio ? Number(trade.rrRatio) : null)}
              </td>
              <td className="px-4 py-3 text-center">
                <GradeBadge grade={trade.grade} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
