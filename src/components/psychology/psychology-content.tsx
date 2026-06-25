"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  Smile,
  Frown,
  Meh,
  CheckCircle,
  XCircle,
  Target,
} from "lucide-react";
import { ChartCard } from "@/components/shared/chart-card";
import { EmptyState } from "@/components/shared/empty-state";
import { GlassCard } from "@/components/ui/card";
import { useTradeModalStore } from "@/stores/trade-modal-store";
import type {
  EmotionPerformance,
  Insight,
  ConfidencePerformance,
  FollowedPlanImpact,
} from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import {
  ChartTooltip,
  chartTooltipCursor,
} from "@/components/shared/recharts-tooltip";

interface PsychologyData {
  emotionData: EmotionPerformance[];
  confidenceData: ConfidencePerformance[];
  followedPlanData: FollowedPlanImpact[];
  insights: Insight[];
}

export function PsychologyContent() {
  const [data, setData] = useState<PsychologyData | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshKey = useTradeModalStore((s) => s.refreshKey);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [emotionRes, confidenceRes, followedPlanRes, insightRes] =
          await Promise.all([
            fetch("/api/analytics?metric=emotionPerformance"),
            fetch("/api/analytics?metric=confidencePerformance"),
            fetch("/api/analytics?metric=followedPlanImpact"),
            fetch("/api/analytics?metric=insights"),
          ]);

        const emotionData = emotionRes.ok ? await emotionRes.json() : [];
        const confidenceData = confidenceRes.ok
          ? await confidenceRes.json()
          : [];
        const followedPlanData = followedPlanRes.ok
          ? await followedPlanRes.json()
          : [];
        const insights = insightRes.ok ? await insightRes.json() : [];

        setData({ emotionData, confidenceData, followedPlanData, insights });
      } catch (error) {
        console.error("Failed to fetch psychology data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refreshKey]);

  if (loading) return null;

  if (!data || data.emotionData.length === 0) {
    return (
      <EmptyState
        icon={Brain}
        title="No psychology data"
        description="Track your emotions on trades to understand how psychology affects your performance."
        showAddTrade
      />
    );
  }

  const { emotionData, confidenceData, followedPlanData, insights } = data;

  const emotionColors: Record<string, string> = {
    CALM: "#00C853",
    FOCUSED: "#00E5FF",
    EXCITED: "#FFD600",
    FEARFUL: "#FF9800",
    REVENGE: "#FF5252",
    FOMO: "#FF5252",
  };

  const sortedEmotions = [...emotionData].sort((a, b) => b.winRate - a.winRate);
  const bestEmotion = sortedEmotions[0];
  const worstEmotion = sortedEmotions[sortedEmotions.length - 1];

  const followedTrue = followedPlanData.find((f) => f.followedPlan === true);
  const followedFalse = followedPlanData.find((f) => f.followedPlan === false);

  return (
    <div className="space-y-6">
      {/* Insights Grid */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </div>
      )}

      {/* Best/Worst Emotion Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bestEmotion && (
          <GlassCard className="p-6 border border-success/20 bg-success/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <Smile className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Best Emotional State
                </p>
                <h3 className="text-xl font-semibold">
                  {bestEmotion.emotion.charAt(0) +
                    bestEmotion.emotion.slice(1).toLowerCase()}
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-success">
                  {bestEmotion.winRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{bestEmotion.trades}</p>
                <p className="text-xs text-muted-foreground">Trades</p>
              </div>
              <div>
                <p
                  className={`text-2xl font-bold ${bestEmotion.avgPnl >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {formatCurrency(bestEmotion.avgPnl)}
                </p>
                <p className="text-xs text-muted-foreground">Avg P&L</p>
              </div>
            </div>
          </GlassCard>
        )}

        {worstEmotion && worstEmotion !== bestEmotion && (
          <GlassCard className="p-6 border border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                <Frown className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Worst Emotional State
                </p>
                <h3 className="text-xl font-semibold">
                  {worstEmotion.emotion.charAt(0) +
                    worstEmotion.emotion.slice(1).toLowerCase()}
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-destructive">
                  {worstEmotion.winRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{worstEmotion.trades}</p>
                <p className="text-xs text-muted-foreground">Trades</p>
              </div>
              <div>
                <p
                  className={`text-2xl font-bold ${worstEmotion.avgPnl >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {formatCurrency(worstEmotion.avgPnl)}
                </p>
                <p className="text-xs text-muted-foreground">Avg P&L</p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Performance Chart */}
        <ChartCard
          title="Win Rate by Emotion"
          description="How different emotional states affect your trading performance"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emotionData} layout="vertical">
                <CartesianGrid
                  stroke="rgba(148, 163, 184, 0.12)"
                  horizontal={false}
                />
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
                  dataKey="emotion"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                  width={80}
                  tickFormatter={(value) =>
                    value.charAt(0) + value.slice(1).toLowerCase()
                  }
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(value) => [
                        `${value.toFixed(1)}%`,
                        "Win Rate",
                      ]}
                    />
                  }
                  cursor={chartTooltipCursor}
                />
                <Bar dataKey="winRate" radius={[0, 4, 4, 0]}>
                  {emotionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={emotionColors[entry.emotion] || "#94A3B8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Confidence Performance Chart */}
        {confidenceData.length > 0 && (
          <ChartCard
            title="Performance by Confidence Level"
            description="How your pre-trade confidence correlates with results"
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={confidenceData}>
                  <defs>
                    <linearGradient
                      id="confidenceGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="rgba(148, 163, 184, 0.12)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="confidence"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
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
                    labelFormatter={(label) => `Confidence: ${label}/10`}
                    cursor={chartTooltipCursor}
                  />
                  <Area
                    type="monotone"
                    dataKey="winRate"
                    stroke="#00E5FF"
                    strokeWidth={2}
                    fill="url(#confidenceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}
      </div>

      {/* Followed Plan Impact */}
      {followedTrue && followedFalse && (
        <ChartCard
          title="Trading Plan Discipline"
          description="Compare your results when following vs deviating from your plan"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="w-14 h-14 rounded-xl bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Followed Plan
                </p>
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-bold text-success">
                    {followedTrue.winRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {followedTrue.trades} trades
                  </p>
                </div>
                <p
                  className={`text-sm ${followedTrue.avgPnl >= 0 ? "text-success" : "text-destructive"}`}
                >
                  Avg: {formatCurrency(followedTrue.avgPnl)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="w-14 h-14 rounded-xl bg-destructive/20 flex items-center justify-center">
                <XCircle className="w-7 h-7 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Deviated from Plan
                </p>
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-bold text-destructive">
                    {followedFalse.winRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {followedFalse.trades} trades
                  </p>
                </div>
                <p
                  className={`text-sm ${followedFalse.avgPnl >= 0 ? "text-success" : "text-destructive"}`}
                >
                  Avg: {formatCurrency(followedFalse.avgPnl)}
                </p>
              </div>
            </div>
          </div>
        </ChartCard>
      )}

      {/* Emotion Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {emotionData.map((emotion) => (
          <GlassCard key={emotion.emotion} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              {emotion.winRate >= 60 ? (
                <Smile className="w-8 h-8 text-success" />
              ) : emotion.winRate >= 40 ? (
                <Meh className="w-8 h-8 text-accent" />
              ) : (
                <Frown className="w-8 h-8 text-destructive" />
              )}
              <div>
                <h3 className="font-semibold">
                  {emotion.emotion.charAt(0) +
                    emotion.emotion.slice(1).toLowerCase()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {emotion.trades} trades
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">
                  {emotion.winRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>
              <div>
                <p
                  className={`text-2xl font-bold ${emotion.avgPnl >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {formatCurrency(emotion.avgPnl)}
                </p>
                <p className="text-xs text-muted-foreground">Avg P&L</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const bgColors = {
    positive: "bg-success/10 border-success/20",
    neutral: "bg-accent/10 border-accent/20",
    warning: "bg-destructive/10 border-destructive/20",
  };

  const iconColors = {
    positive: "text-success",
    neutral: "text-accent",
    warning: "text-destructive",
  };

  const icons = {
    emotion: Brain,
    confidence: Target,
    mistake: XCircle,
    setup: CheckCircle,
  };

  const Icon = icons[insight.type] || Brain;

  return (
    <GlassCard className={`p-6 border ${bgColors[insight.severity]}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${iconColors[insight.severity]}`} />
        <div>
          <p className="font-medium mb-1">{insight.headline}</p>
          <p className="text-2xl font-bold mb-2">{insight.stat}</p>
          <p className="text-sm text-muted-foreground">
            {insight.recommendation}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
