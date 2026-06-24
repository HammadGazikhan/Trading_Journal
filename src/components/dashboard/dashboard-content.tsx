"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
  Activity,
  Zap,
} from "lucide-react";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useTradeModalStore } from "@/stores/trade-modal-store";
import type { DashboardMetrics } from "@/types";
import { EquityCurveChart } from "./equity-curve-chart";
import { DailyPnLChart } from "./daily-pnl-chart";
import { WinLossChart } from "./win-loss-chart";
import { SetupPerformanceChart } from "./setup-performance-chart";
import { PerformanceByDayHeatmap } from "./performance-by-day-heatmap";
import { RecentTradesTable } from "./recent-trades-table";

export function DashboardContent() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshKey = useTradeModalStore((s) => s.refreshKey);

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      try {
        const response = await fetch("/api/analytics?metric=dashboard");
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard metrics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, [refreshKey]);

  if (loading) {
    return null;
  }

  if (!metrics || metrics.totalTrades === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No trades yet"
        description="Start logging your trades to see your performance dashboard come to life with charts and analytics."
        showAddTrade
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total P&L"
          value={metrics.totalPnl}
          format="currency"
          icon={DollarSign}
          trend={metrics.totalPnl >= 0 ? "positive" : "negative"}
        />
        <KpiCard
          title="Win Rate"
          value={metrics.winRate}
          format="percent"
          icon={TrendingUp}
          trend={metrics.winRate >= 50 ? "positive" : "negative"}
        />
        <KpiCard
          title="Profit Factor"
          value={metrics.profitFactor}
          format="number"
          icon={Target}
          trend={metrics.profitFactor >= 1 ? "positive" : "negative"}
        />
        <KpiCard
          title="Total Trades"
          value={metrics.totalTrades}
          format="number"
          icon={BarChart3}
          trend="neutral"
        />
        <KpiCard
          title="Average RR"
          value={metrics.averageRR}
          format="rr"
          icon={Activity}
          trend={metrics.averageRR >= 1 ? "positive" : "negative"}
        />
        <KpiCard
          title="Current Streak"
          value={metrics.currentStreak}
          format="number"
          suffix={metrics.streakType === "win" ? " wins" : metrics.streakType === "loss" ? " losses" : ""}
          icon={Zap}
          trend={metrics.streakType === "win" ? "positive" : metrics.streakType === "loss" ? "negative" : "neutral"}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Equity Curve" description="Account growth over time">
          <EquityCurveChart />
        </ChartCard>
        <ChartCard title="Daily P&L" description="Profit/Loss by day">
          <DailyPnLChart />
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Win vs Loss">
          <WinLossChart />
        </ChartCard>
        <ChartCard title="Performance by Setup" className="lg:col-span-2">
          <SetupPerformanceChart />
        </ChartCard>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartCard
          title="Performance by Day"
          description="Weekly heatmap of win rate and net P&L"
        >
          <PerformanceByDayHeatmap />
        </ChartCard>
        <ChartCard
          title="Recent Trades"
          description="Your latest trading activity"
          className="xl:col-span-2"
        >
          <RecentTradesTable />
        </ChartCard>
      </div>
    </div>
  );
}
