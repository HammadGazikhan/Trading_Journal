"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import {
  formatCurrency,
  formatDirection,
  formatEmotion,
  formatMistake,
  formatPercent,
  formatSetup,
  formatSession,
} from "@/lib/utils";
import { ChartTooltip, chartTooltipCursor } from "@/components/shared/recharts-tooltip";

function EmptyChart() {
  return (
    <div className="flex h-72 items-center justify-center text-muted-foreground">
      No data available
    </div>
  );
}

export function AnalyticsEquityCurveChart({
  data,
}: {
  data: EquityCurvePoint[];
}) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="analyticsEquityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
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
              formatCurrency(Number(value), { notation: "compact" })
            }
          />
          <Tooltip
            content={
              <ChartTooltip
                formatter={(value, _name, dataKey) =>
                  dataKey === "pnl"
                    ? [formatCurrency(value), "Trade P&L"]
                    : [formatCurrency(value), "Equity"]
                }
              />
            }
            cursor={chartTooltipCursor}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke="#00E5FF"
            strokeWidth={2}
            fill="url(#analyticsEquityGradient)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WinRateBySetupChart({
  data,
}: {
  data: SetupPerformance[];
}) {
  if (data.length === 0) return <EmptyChart />;

  const chartData = data.slice(0, 6).map((item) => ({
    ...item,
    setupLabel: formatSetup(item.setup),
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" horizontal={false} />
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
            dataKey="setupLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            width={120}
          />
          <Tooltip
            content={
              <ChartTooltip
                formatter={(value, _name, dataKey) =>
                  dataKey === "winRate"
                    ? [`${value.toFixed(1)}%`, "Win Rate"]
                    : [String(value), "Setup"]
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

export function ProfitBySetupChart({
  data,
}: {
  data: SetupPerformance[];
}) {
  if (data.length === 0) return <EmptyChart />;

  const chartData = data.slice(0, 6).map((item) => ({
    ...item,
    setupLabel: formatSetup(item.setup),
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
          <XAxis
            dataKey="setupLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={56}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            tickFormatter={(value) =>
              formatCurrency(Number(value), { notation: "compact" })
            }
          />
          <Tooltip
            content={
              <ChartTooltip
                formatter={(value) => [formatCurrency(value), "Net P&L"]}
              />
            }
            cursor={chartTooltipCursor}
          />
          <Bar dataKey="totalPnl" radius={[4, 4, 0, 0]} animationDuration={1000}>
            {chartData.map((entry) => (
              <Cell
                key={entry.setup}
                fill={entry.totalPnl >= 0 ? "#00C853" : "#FF5252"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WinRateByDayChart({
  data,
}: {
  data: DayPerformance[];
}) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
          <XAxis
            dataKey="day"
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
                    : [String(value), "Day"]
                }
              />
            }
            cursor={chartTooltipCursor}
          />
          <Bar dataKey="winRate" fill="#00E5FF" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WinRateByMonthChart({
  data,
}: {
  data: MonthlyPerformance[];
}) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="analyticsWinRateMonthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00C853" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#00C853" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
          <XAxis
            dataKey="month"
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
            cursor={chartTooltipCursor}
          />
          <Area
            type="monotone"
            dataKey="winRate"
            stroke="#00C853"
            strokeWidth={2}
            fill="url(#analyticsWinRateMonthGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WinRateByTimeChart({
  data,
}: {
  data: TimePerformance[];
}) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={56}
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
                    : [String(value), "Time"]
                }
              />
            }
            cursor={chartTooltipCursor}
          />
          <Bar dataKey="winRate" radius={[4, 4, 0, 0]} animationDuration={1000}>
            {data.map((entry) => (
              <Cell
                key={entry.label}
                fill={entry.winRate >= 50 ? "#00C853" : "#FF5252"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DirectionPerformanceChart({
  data,
}: {
  data: DirectionPerformance[];
}) {
  if (data.length === 0) return <EmptyChart />;

  const chartData = data.map((item) => ({
    ...item,
    directionLabel: formatDirection(item.direction),
  }));

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
            <XAxis
              dataKey="directionLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              tickFormatter={(value) =>
                formatCurrency(Number(value), { notation: "compact" })
              }
            />
            <Tooltip
              content={
                <ChartTooltip
                  formatter={(value, _name, dataKey) =>
                    dataKey === "totalPnl"
                      ? [formatCurrency(value), "Total P&L"]
                      : [formatCurrency(value), "Average P&L"]
                  }
                />
              }
              cursor={chartTooltipCursor}
            />
            <Bar dataKey="totalPnl" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.direction}
                  fill={entry.totalPnl >= 0 ? "#00C853" : "#FF5252"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {chartData.map((entry) => (
          <div
            key={entry.direction}
            className="rounded-xl border border-white/10 bg-surface/50 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{entry.directionLabel}</p>
              <span className="text-sm text-muted-foreground">
                {entry.trades} trades
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Win rate:{" "}
              <span className="font-medium text-foreground">
                {formatPercent(entry.winRate)}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Average P&L:{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(entry.avgPnl)}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmotionAnalysisChart({
  data,
}: {
  data: EmotionPerformance[];
}) {
  if (data.length === 0) return <EmptyChart />;

  const chartData = [...data]
    .sort((a, b) => b.avgPnl - a.avgPnl)
    .map((item) => ({
      ...item,
      emotionLabel: formatEmotion(item.emotion),
    }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" horizontal={false} />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            tickFormatter={(value) =>
              formatCurrency(Number(value), { notation: "compact" })
            }
          />
          <YAxis
            type="category"
            dataKey="emotionLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            width={90}
          />
          <Tooltip
            content={
              <ChartTooltip
                formatter={(value, _name, dataKey) =>
                  dataKey === "avgPnl"
                    ? [formatCurrency(value), "Average P&L"]
                    : [String(value), "Emotion"]
                }
              />
            }
            cursor={chartTooltipCursor}
          />
          <Bar dataKey="avgPnl" radius={[0, 4, 4, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={entry.emotion}
                fill={entry.avgPnl >= 0 ? "#00C853" : "#FF5252"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MistakeAnalysisChart({
  data,
}: {
  data: MistakeAnalysis[];
}) {
  if (data.length === 0) return <EmptyChart />;

  const chartData = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((item) => ({
      ...item,
      mistakeLabel: formatMistake(item.mistake),
    }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" horizontal={false} />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="mistakeLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            width={130}
          />
          <Tooltip
            content={
              <ChartTooltip
                formatter={(value, _name, dataKey) =>
                  dataKey === "count"
                    ? [String(value), "Occurrences"]
                    : [String(value), "Mistake"]
                }
              />
            }
            cursor={chartTooltipCursor}
          />
          <Bar dataKey="count" fill="#FF5252" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RRDistributionChart({
  data,
}: {
  data: RRDistribution[];
}) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
          <XAxis
            dataKey="range"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={56}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            content={
              <ChartTooltip
                formatter={(value) => [String(value), "Trades"]}
              />
            }
            cursor={chartTooltipCursor}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.range}
                fill={
                  entry.range.includes("-")
                    ? entry.range === "-1R to 0R" || entry.range === "-2R to -1R"
                      ? "#FF5252"
                      : "#00E5FF"
                    : entry.range === "< -2R"
                      ? "#FF5252"
                      : entry.range === "0R to 1R"
                        ? "#00E5FF"
                        : "#00C853"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SessionPerformanceChart({
  data,
}: {
  data: SessionPerformance[];
}) {
  if (data.length === 0 || data.every(d => d.trades === 0)) return <EmptyChart />;

  const chartData = data
    .filter(d => d.trades > 0)
    .map((item) => ({
      ...item,
      sessionLabel: formatSession(item.session),
    }));

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
            <XAxis
              dataKey="sessionLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              tickFormatter={(value) =>
                formatCurrency(Number(value), { notation: "compact" })
              }
            />
            <Tooltip
              content={
                <ChartTooltip
                  formatter={(value, _name, dataKey) =>
                    dataKey === "totalPnl"
                      ? [formatCurrency(value), "Total P&L"]
                      : [String(value), "Value"]
                  }
                />
              }
              cursor={chartTooltipCursor}
            />
            <Bar dataKey="totalPnl" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.session}
                  fill={entry.totalPnl >= 0 ? "#00C853" : "#FF5252"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {chartData.map((entry) => (
          <div
            key={entry.session}
            className="rounded-xl border border-white/10 bg-surface/50 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground text-sm">{entry.sessionLabel}</p>
              <span className="text-xs text-muted-foreground">
                {entry.trades} trades
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Win rate:{" "}
              <span className="font-medium text-foreground">
                {formatPercent(entry.winRate)}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Profit factor:{" "}
              <span className="font-medium text-foreground">
                {entry.profitFactor === 999 ? "∞" : entry.profitFactor.toFixed(2)}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PnLByDayChart({
  data,
}: {
  data: DayPerformance[];
}) {
  if (data.length === 0 || data.every(d => d.trades === 0)) return <EmptyChart />;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            tickFormatter={(value) =>
              formatCurrency(Number(value), { notation: "compact" })
            }
          />
          <Tooltip
            content={
              <ChartTooltip
                formatter={(value, _name, dataKey) =>
                  dataKey === "pnl"
                    ? [formatCurrency(value), "P&L"]
                    : [String(value), "Day"]
                }
              />
            }
            cursor={chartTooltipCursor}
          />
          <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.day}
                fill={entry.pnl >= 0 ? "#00C853" : "#FF5252"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
