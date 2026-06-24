"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Target,
  Activity,
  BarChart3,
  DollarSign,
  Minus,
} from "lucide-react";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useTradeModalStore } from "@/stores/trade-modal-store";
import {
  AnalyticsEquityCurveChart,
  DirectionPerformanceChart,
  EmotionAnalysisChart,
  MistakeAnalysisChart,
  ProfitBySetupChart,
  RRDistributionChart,
  WinRateByDayChart,
  WinRateByMonthChart,
  WinRateBySetupChart,
  WinRateByTimeChart,
  SessionPerformanceChart,
  PnLByDayChart,
} from "@/components/analytics/analytics-charts";
import type {
  DayPerformance,
  DirectionPerformance,
  EmotionPerformance,
  EquityCurvePoint,
  MistakeAnalysis,
  MonthlyPerformance,
  RRDistribution,
  SetupPerformance,
  SessionPerformance,
  TimePerformance,
} from "@/types";

interface AnalyticsMetrics {
  winRate: number;
  profitFactor: number;
  averageRR: number;
  expectancy: number;
  averageWinner: number;
  averageLoser: number;
  totalTrades: number;
}

interface AnalyticsDataset {
  metrics: AnalyticsMetrics;
  equityCurve: EquityCurvePoint[];
  setupPerformance: SetupPerformance[];
  dayPerformance: DayPerformance[];
  monthPerformance: MonthlyPerformance[];
  timePerformance: TimePerformance[];
  directionPerformance: DirectionPerformance[];
  emotionPerformance: EmotionPerformance[];
  mistakeAnalysis: MistakeAnalysis[];
  rrDistribution: RRDistribution[];
  sessionPerformance: SessionPerformance[];
}

async function fetchMetric<T>(metric: string): Promise<T> {
  const response = await fetch(`/api/analytics?metric=${metric}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${metric}`);
  }

  return response.json() as Promise<T>;
}

export function AnalyticsContent() {
  const [data, setData] = useState<AnalyticsDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshKey = useTradeModalStore((s) => s.refreshKey);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);

      try {
        const [
          metrics,
          equityCurve,
          setupPerformance,
          dayPerformance,
          monthPerformance,
          timePerformance,
          directionPerformance,
          emotionPerformance,
          mistakeAnalysis,
          rrDistribution,
          sessionPerformance,
        ] = await Promise.all([
          fetchMetric<AnalyticsMetrics>("full"),
          fetchMetric<EquityCurvePoint[]>("equityCurve"),
          fetchMetric<SetupPerformance[]>("setupPerformance"),
          fetchMetric<DayPerformance[]>("dayPerformance"),
          fetchMetric<MonthlyPerformance[]>("monthPerformance"),
          fetchMetric<TimePerformance[]>("timePerformance"),
          fetchMetric<DirectionPerformance[]>("directionPerformance"),
          fetchMetric<EmotionPerformance[]>("emotionPerformance"),
          fetchMetric<MistakeAnalysis[]>("mistakeAnalysis"),
          fetchMetric<RRDistribution[]>("rrDistribution"),
          fetchMetric<SessionPerformance[]>("sessionPerformance"),
        ]);

        setData({
          metrics,
          equityCurve,
          setupPerformance,
          dayPerformance,
          monthPerformance,
          timePerformance,
          directionPerformance,
          emotionPerformance,
          mistakeAnalysis,
          rrDistribution,
          sessionPerformance,
        });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [refreshKey]);

  if (loading) return null;

  if (!data || data.metrics.totalTrades === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No analytics data"
        description="Start logging trades to see detailed performance analytics."
        showAddTrade
      />
    );
  }

  const { metrics } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
          title="Average RR"
          value={metrics.averageRR}
          format="rr"
          icon={Activity}
          trend={metrics.averageRR >= 1 ? "positive" : "negative"}
        />
        <KpiCard
          title="Expectancy"
          value={metrics.expectancy}
          format="currency"
          icon={BarChart3}
          trend={metrics.expectancy >= 0 ? "positive" : "negative"}
        />
        <KpiCard
          title="Avg Winner"
          value={metrics.averageWinner}
          format="currency"
          icon={DollarSign}
          trend="positive"
        />
        <KpiCard
          title="Avg Loser"
          value={metrics.averageLoser}
          format="currency"
          icon={Minus}
          trend="negative"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Equity Curve" description="Account growth over time">
          <AnalyticsEquityCurveChart data={data.equityCurve} />
        </ChartCard>
        <ChartCard
          title="Win Rate by Month"
          description="Monthly consistency and seasonality in your results"
        >
          <WinRateByMonthChart data={data.monthPerformance} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Win Rate by Setup"
          description="See which setups convert most reliably"
        >
          <WinRateBySetupChart data={data.setupPerformance} />
        </ChartCard>
        <ChartCard
          title="Profit by Setup"
          description="Find the setups that actually drive your P&L"
        >
          <ProfitBySetupChart data={data.setupPerformance} />
        </ChartCard>
      </div>

      <ChartCard
        title="Session Performance"
        description="Analyze your performance across different trading sessions"
      >
        <SessionPerformanceChart data={data.sessionPerformance} />
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Win Rate by Day"
          description="Spot the weekdays where your edge is strongest"
        >
          <WinRateByDayChart data={data.dayPerformance} />
        </ChartCard>
        <ChartCard
          title="P&L by Day"
          description="See which days contribute most to your bottom line"
        >
          <PnLByDayChart data={data.dayPerformance} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Win Rate by Time"
          description="Track when your execution performs best during the session"
        >
          <WinRateByTimeChart data={data.timePerformance} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Long vs Short"
          description="Compare profitability and consistency by trade direction"
        >
          <DirectionPerformanceChart data={data.directionPerformance} />
        </ChartCard>
        <ChartCard
          title="Emotion Analysis"
          description="Understand which emotional states support your best trading"
        >
          <EmotionAnalysisChart data={data.emotionPerformance} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Mistake Analysis"
          description="See which recurring mistakes show up most often"
        >
          <MistakeAnalysisChart data={data.mistakeAnalysis} />
        </ChartCard>
        <ChartCard
          title="RR Distribution"
          description="Visualize the spread of outcomes across your risk multiple"
        >
          <RRDistributionChart data={data.rrDistribution} />
        </ChartCard>
      </div>
    </div>
  );
}
