"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  TrendingDown,
  Hash,
  DollarSign,
  X,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { EmptyState } from "@/components/shared/empty-state";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTradeModalStore } from "@/stores/trade-modal-store";
import type { MistakeAnalysis, MistakesOverTime, TradeByMistake } from "@/types";
import { formatMistake, formatCurrency, cn } from "@/lib/utils";
import { ChartTooltip, chartTooltipCursor } from "@/components/shared/recharts-tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Area,
  ComposedChart,
} from "recharts";
import Link from "next/link";

interface MistakesData {
  analysis: MistakeAnalysis[];
  overTime: MistakesOverTime[];
}

export function MistakesContent() {
  const [data, setData] = useState<MistakesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMistake, setSelectedMistake] = useState<string | null>(null);
  const [mistakeTrades, setMistakeTrades] = useState<TradeByMistake[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const refreshKey = useTradeModalStore((s) => s.refreshKey);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [analysisRes, overTimeRes] = await Promise.all([
          fetch("/api/analytics?metric=mistakeAnalysis"),
          fetch("/api/analytics?metric=mistakesOverTime"),
        ]);

        const analysis = analysisRes.ok ? await analysisRes.json() : [];
        const overTime = overTimeRes.ok ? await overTimeRes.json() : [];

        setData({ analysis, overTime });
      } catch (error) {
        console.error("Failed to fetch mistake data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refreshKey]);

  const fetchTradesByMistake = async (mistake: string) => {
    setLoadingTrades(true);
    try {
      const response = await fetch(
        `/api/analytics?metric=tradesByMistake&mistake=${encodeURIComponent(mistake)}`
      );
      if (response.ok) {
        setMistakeTrades(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch trades for mistake:", error);
    } finally {
      setLoadingTrades(false);
    }
  };

  const handleMistakeClick = (mistake: string) => {
    setSelectedMistake(mistake);
    fetchTradesByMistake(mistake);
  };

  if (loading) return null;

  const filteredMistakes = data?.analysis.filter((m) => m.mistake !== "NO_MISTAKE") ?? [];

  if (filteredMistakes.length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No mistakes tracked"
        description="Tag mistakes on your trades to track patterns and learn from them."
        showAddTrade
      />
    );
  }

  const totalMistakes = filteredMistakes.reduce((sum, m) => sum + m.count, 0);
  const totalLoss = filteredMistakes.reduce((sum, m) => sum + m.totalLoss, 0);
  const worstMistake = filteredMistakes.reduce(
    (worst, m) => (m.totalLoss < worst.totalLoss ? m : worst),
    filteredMistakes[0]
  );
  const mostFrequent = filteredMistakes.reduce(
    (most, m) => (m.count > most.count ? m : most),
    filteredMistakes[0]
  );

  const chartData = filteredMistakes
    .map((m) => ({
      count: m.count,
      avgLoss: m.avgLoss,
      mistake: formatMistake(m.mistake),
      rawMistake: m.mistake,
      totalLoss: Math.abs(m.totalLoss),
    }))
    .sort((a, b) => b.count - a.count);

  type ChartDataItem = (typeof chartData)[number];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Mistakes"
          value={totalMistakes}
          format="number"
          icon={Hash}
          trend="negative"
        />
        <KpiCard
          title="Total Lost to Mistakes"
          value={Math.abs(totalLoss)}
          format="currency"
          prefix="-$"
          icon={DollarSign}
          trend="negative"
        />
        <KpiCard
          title="Most Frequent"
          value={mostFrequent.count}
          format="number"
          suffix={` (${formatMistake(mostFrequent.mistake)})`}
          icon={AlertTriangle}
          trend="negative"
        />
        <KpiCard
          title="Most Costly"
          value={Math.abs(worstMistake.totalLoss)}
          format="currency"
          prefix="-$"
          description={formatMistake(worstMistake.mistake)}
          icon={TrendingDown}
          trend="negative"
        />
      </div>

      {/* Mistakes Over Time Chart */}
      {data?.overTime && data.overTime.length > 1 && (
        <ChartCard
          title="Mistakes Over Time"
          description="Monthly trend of mistakes and associated losses"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.overTime}>
                <defs>
                  <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5252" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF5252" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                <XAxis
                  dataKey="period"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(Math.abs(value), { notation: "compact" })}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(value, _name, dataKey) =>
                        dataKey === "count"
                          ? [String(value), "Mistakes"]
                          : [formatCurrency(Math.abs(value)), "Loss"]
                      }
                    />
                  }
                  cursor={chartTooltipCursor}
                />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  fill="#FF5252"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="totalLoss"
                  stroke="#FF9800"
                  strokeWidth={2}
                  fill="url(#lossGradient)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mistake Frequency Chart */}
        <ChartCard
          title="Mistake Frequency"
          description="Click a bar to see related trades"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                <XAxis
                  dataKey="mistake"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                />
                <Tooltip
                  content={<ChartTooltip formatter={(value) => [String(value), "Mistakes"]} />}
                  cursor={chartTooltipCursor}
                />
                <Bar
                  dataKey="count"
                  fill="#FF5252"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  cursor="pointer"
                  onClick={(_, index) => handleMistakeClick(chartData[index].rawMistake)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Money Lost Chart */}
        <ChartCard
          title="Money Lost by Mistake"
          description="Financial impact of each mistake category"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value, { notation: "compact" })}
                />
                <YAxis
                  type="category"
                  dataKey="mistake"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  width={100}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(value) => [formatCurrency(value), "Lost"]}
                    />
                  }
                  cursor={chartTooltipCursor}
                />
                <Bar
                  dataKey="totalLoss"
                  fill="#FF5252"
                  radius={[0, 4, 4, 0]}
                  animationDuration={1000}
                  cursor="pointer"
                  onClick={(_, index) => handleMistakeClick(chartData[index].rawMistake)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Ranked Mistake List */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Biggest Money-Losing Mistakes</h3>
        <div className="space-y-3">
          {filteredMistakes
            .sort((a, b) => a.totalLoss - b.totalLoss)
            .map((mistake, index) => (
              <button
                key={mistake.mistake}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer text-left"
                onClick={() => handleMistakeClick(mistake.mistake)}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                    index === 0
                      ? "bg-destructive/20 text-destructive"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{formatMistake(mistake.mistake)}</p>
                  <p className="text-sm text-muted-foreground">
                    {mistake.count} occurrence{mistake.count !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-destructive">
                    {formatCurrency(mistake.totalLoss)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Avg: {formatCurrency(mistake.avgLoss)}
                  </p>
                </div>
              </button>
            ))}
        </div>
      </GlassCard>

      {/* Drill-down Modal */}
      <AnimatePresence>
        {selectedMistake && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedMistake(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[80vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-xl font-semibold">
                    {formatMistake(selectedMistake)} Trades
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {mistakeTrades.length} trade{mistakeTrades.length !== 1 ? "s" : ""} with
                    this mistake
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedMistake(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {loadingTrades ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : mistakeTrades.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    No trades found for this mistake.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {mistakeTrades.map((trade) => (
                      <Link
                        key={trade.id}
                        href={`/journal/${trade.id}`}
                        className="flex items-center gap-4 p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            trade.direction === "LONG"
                              ? "bg-success/20"
                              : "bg-destructive/20"
                          )}
                        >
                          {trade.direction === "LONG" ? (
                            <TrendingUp className="w-5 h-5 text-success" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{trade.instrument}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(trade.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p
                            className={cn(
                              "text-lg font-bold",
                              trade.pnl >= 0 ? "text-success" : "text-destructive"
                            )}
                          >
                            {formatCurrency(trade.pnl)}
                          </p>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
