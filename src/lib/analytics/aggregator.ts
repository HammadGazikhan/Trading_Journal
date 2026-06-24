import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import {
  calculateWinRate,
  calculateProfitFactor,
  calculateExpectancy,
} from "@/lib/calculations/trade-metrics";
import type {
  DashboardMetrics,
  EquityCurvePoint,
  DailyPnL,
  WinLossData,
  SetupPerformance,
  DayPerformance,
  MonthlyPerformance,
  TimePerformance,
  DirectionPerformance,
  EmotionPerformance,
  MistakeAnalysis,
  RRDistribution,
  Insight,
  SessionPerformance,
  TradeSession,
  DayOfWeek,
  ConfidencePerformance,
  EmotionComparison,
  FollowedPlanImpact,
  MistakesOverTime,
  TradeByMistake,
} from "@/types";
import { getDayOfWeekOrder, formatDayOfWeek } from "@/lib/calculations/day-of-week";

export interface AnalyticsFilters {
  session?: TradeSession;
  dayOfWeek?: DayOfWeek;
  startDate?: Date;
  endDate?: Date;
}

function toNumber(value: Decimal | number | null): number {
  if (value === null) return 0;
  return typeof value === "number" ? value : value.toNumber();
}

function buildTradeWhere(userId: string, filters?: AnalyticsFilters) {
  const where: Record<string, unknown> = { userId };
  
  if (filters?.session) {
    where.session = filters.session;
  }
  if (filters?.dayOfWeek) {
    where.dayOfWeek = filters.dayOfWeek;
  }
  if (filters?.startDate || filters?.endDate) {
    where.date = {};
    if (filters.startDate) {
      (where.date as Record<string, Date>).gte = filters.startDate;
    }
    if (filters.endDate) {
      (where.date as Record<string, Date>).lte = filters.endDate;
    }
  }
  
  return where;
}

export async function getDashboardMetrics(
  userId: string,
  filters?: AnalyticsFilters
): Promise<DashboardMetrics> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    orderBy: { date: "desc" },
    select: { pnl: true, rrRatio: true, date: true },
  });

  if (trades.length === 0) {
    return {
      totalPnl: 0,
      winRate: 0,
      profitFactor: 0,
      totalTrades: 0,
      averageRR: 0,
      currentStreak: 0,
      streakType: "none",
    };
  }

  const pnls = trades.map((t) => toNumber(t.pnl));
  const wins = pnls.filter((p) => p > 0);
  const losses = pnls.filter((p) => p < 0);

  const totalPnl = pnls.reduce((sum, p) => sum + p, 0);
  const winRate = calculateWinRate(wins.length, trades.length);
  const totalWins = wins.reduce((sum, p) => sum + p, 0);
  const totalLosses = Math.abs(losses.reduce((sum, p) => sum + p, 0));
  const profitFactor = calculateProfitFactor(totalWins, totalLosses);

  const rrValues = trades
    .map((t) => toNumber(t.rrRatio))
    .filter((r) => r !== 0);
  const averageRR =
    rrValues.length > 0
      ? rrValues.reduce((sum, r) => sum + r, 0) / rrValues.length
      : 0;

  // Calculate streak
  let currentStreak = 0;
  let streakType: "win" | "loss" | "none" = "none";
  if (trades.length > 0) {
    const firstPnl = toNumber(trades[0].pnl);
    streakType = firstPnl > 0 ? "win" : firstPnl < 0 ? "loss" : "none";
    for (const trade of trades) {
      const pnl = toNumber(trade.pnl);
      if (
        (streakType === "win" && pnl > 0) ||
        (streakType === "loss" && pnl < 0)
      ) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return {
    totalPnl,
    winRate,
    profitFactor: profitFactor === Infinity ? 999 : profitFactor,
    totalTrades: trades.length,
    averageRR,
    currentStreak,
    streakType,
  };
}

export async function getFullAnalytics(userId: string, filters?: AnalyticsFilters) {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    select: { pnl: true, rrRatio: true },
  });

  if (trades.length === 0) {
    return {
      winRate: 0,
      profitFactor: 0,
      averageRR: 0,
      expectancy: 0,
      averageWinner: 0,
      averageLoser: 0,
      totalTrades: 0,
    };
  }

  const pnls = trades.map((t) => toNumber(t.pnl));
  const wins = pnls.filter((p) => p > 0);
  const losses = pnls.filter((p) => p < 0);

  const winRate = calculateWinRate(wins.length, trades.length);
  const totalWins = wins.reduce((sum, p) => sum + p, 0);
  const totalLosses = Math.abs(losses.reduce((sum, p) => sum + p, 0));
  const profitFactor = calculateProfitFactor(totalWins, totalLosses);

  const averageWinner = wins.length > 0 ? totalWins / wins.length : 0;
  const averageLoser = losses.length > 0 ? totalLosses / losses.length : 0;

  const rrValues = trades.map((t) => toNumber(t.rrRatio)).filter((r) => r !== 0);
  const averageRR =
    rrValues.length > 0
      ? rrValues.reduce((sum, r) => sum + r, 0) / rrValues.length
      : 0;

  const expectancy = calculateExpectancy(winRate, averageWinner, averageLoser);

  return {
    winRate,
    profitFactor: profitFactor === Infinity ? 999 : profitFactor,
    averageRR,
    expectancy,
    averageWinner,
    averageLoser: -averageLoser,
    totalTrades: trades.length,
  };
}

export async function getEquityCurve(userId: string, filters?: AnalyticsFilters): Promise<EquityCurvePoint[]> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    orderBy: { date: "asc" },
    select: { date: true, pnl: true },
  });

  let equity = 0;
  return trades.map((trade) => {
    equity += toNumber(trade.pnl);
    return {
      date: new Date(trade.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      equity,
      pnl: toNumber(trade.pnl),
    };
  });
}

export async function getDailyPnL(userId: string, filters?: AnalyticsFilters): Promise<DailyPnL[]> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    orderBy: { date: "asc" },
    select: { date: true, pnl: true },
  });

  const dailyMap = new Map<string, number>();
  trades.forEach((trade) => {
    const date = new Date(trade.date).toISOString().split("T")[0];
    dailyMap.set(date, (dailyMap.get(date) || 0) + toNumber(trade.pnl));
  });

  return Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => ({
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      pnl,
    }))
    .slice(-30);
}

export async function getWinLoss(userId: string, filters?: AnalyticsFilters): Promise<WinLossData> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    select: { pnl: true },
  });

  let wins = 0,
    losses = 0,
    breakeven = 0;
  trades.forEach((trade) => {
    const pnl = toNumber(trade.pnl);
    if (pnl > 0) wins++;
    else if (pnl < 0) losses++;
    else breakeven++;
  });

  return { wins, losses, breakeven };
}

export async function getSetupPerformance(
  userId: string,
  filters?: AnalyticsFilters
): Promise<SetupPerformance[]> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    select: { setup: true, pnl: true },
  });

  const setupMap = new Map<string, { wins: number; total: number; pnl: number }>();
  trades.forEach((trade) => {
    const current = setupMap.get(trade.setup) || { wins: 0, total: 0, pnl: 0 };
    current.total++;
    current.pnl += toNumber(trade.pnl);
    if (toNumber(trade.pnl) > 0) current.wins++;
    setupMap.set(trade.setup, current);
  });

  return Array.from(setupMap.entries())
    .map(([setup, data]) => ({
      setup,
      winRate: (data.wins / data.total) * 100,
      totalPnl: data.pnl,
      trades: data.total,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl);
}

export async function getDayPerformance(
  userId: string,
  filters?: AnalyticsFilters
): Promise<DayPerformance[]> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    select: { dayOfWeek: true, pnl: true },
  });

  const dayOrder = getDayOfWeekOrder();
  const dayMap = new Map(
    dayOrder.map((day) => [day, { wins: 0, total: 0, pnl: 0 }])
  );

  trades.forEach((trade) => {
    const current = dayMap.get(trade.dayOfWeek);
    if (!current) return;

    const pnl = toNumber(trade.pnl);
    current.total += 1;
    current.pnl += pnl;
    if (pnl > 0) current.wins += 1;
  });

  return dayOrder.map((day) => {
    const data = dayMap.get(day) ?? { wins: 0, total: 0, pnl: 0 };
    return {
      day: formatDayOfWeek(day),
      winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
      trades: data.total,
      pnl: data.pnl,
    };
  });
}

export async function getMonthPerformance(
  userId: string,
  filters?: AnalyticsFilters
): Promise<MonthlyPerformance[]> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    orderBy: { date: "asc" },
    select: { date: true, pnl: true },
  });

  const monthMap = new Map<string, { wins: number; total: number; pnl: number }>();

  trades.forEach((trade) => {
    const date = new Date(trade.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const current = monthMap.get(monthKey) ?? { wins: 0, total: 0, pnl: 0 };
    const pnl = toNumber(trade.pnl);

    current.total += 1;
    current.pnl += pnl;
    if (pnl > 0) current.wins += 1;

    monthMap.set(monthKey, current);
  });

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, data]) => {
      const [year, month] = monthKey.split("-");
      const date = new Date(Number(year), Number(month) - 1, 1);

      return {
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
        trades: data.total,
        pnl: data.pnl,
      };
    })
    .slice(-12);
}

const TIME_BUCKETS = [
  { label: "Pre-Market", start: 0, end: 9 },
  { label: "Open", start: 9, end: 10 },
  { label: "Morning", start: 10, end: 12 },
  { label: "Midday", start: 12, end: 14 },
  { label: "Afternoon", start: 14, end: 16 },
  { label: "After Hours", start: 16, end: 24 },
] as const;

export async function getTimePerformance(
  userId: string,
  filters?: AnalyticsFilters
): Promise<TimePerformance[]> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    select: { date: true, pnl: true },
  });

  const bucketMap = new Map(
    TIME_BUCKETS.map((bucket) => [
      bucket.label,
      { wins: 0, total: 0, pnl: 0 },
    ])
  );

  trades.forEach((trade) => {
    const hour = new Date(trade.date).getHours();
    const bucket =
      TIME_BUCKETS.find((item) => hour >= item.start && hour < item.end) ??
      TIME_BUCKETS[TIME_BUCKETS.length - 1];
    const current = bucketMap.get(bucket.label);
    if (!current) return;

    const pnl = toNumber(trade.pnl);
    current.total += 1;
    current.pnl += pnl;
    if (pnl > 0) current.wins += 1;
  });

  return TIME_BUCKETS.map((bucket) => {
    const data = bucketMap.get(bucket.label) ?? { wins: 0, total: 0, pnl: 0 };

    return {
      label: bucket.label,
      winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
      trades: data.total,
      avgPnl: data.total > 0 ? data.pnl / data.total : 0,
    };
  });
}

export async function getDirectionPerformance(
  userId: string,
  filters?: AnalyticsFilters
): Promise<DirectionPerformance[]> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    select: { direction: true, pnl: true },
  });

  const directionMap = new Map<
    "LONG" | "SHORT",
    { wins: number; total: number; pnl: number }
  >([
    ["LONG", { wins: 0, total: 0, pnl: 0 }],
    ["SHORT", { wins: 0, total: 0, pnl: 0 }],
  ]);

  trades.forEach((trade) => {
    const current = directionMap.get(trade.direction);
    if (!current) return;

    const pnl = toNumber(trade.pnl);
    current.total += 1;
    current.pnl += pnl;
    if (pnl > 0) current.wins += 1;
  });

  return Array.from(directionMap.entries()).map(([direction, data]) => ({
    direction,
    winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
    totalPnl: data.pnl,
    avgPnl: data.total > 0 ? data.pnl / data.total : 0,
    trades: data.total,
  }));
}

export async function getRRDistribution(
  userId: string,
  filters?: AnalyticsFilters
): Promise<RRDistribution[]> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    select: { rrRatio: true },
  });

  const ranges = [
    { label: "< -2R", min: Number.NEGATIVE_INFINITY, max: -2 },
    { label: "-2R to -1R", min: -2, max: -1 },
    { label: "-1R to 0R", min: -1, max: 0 },
    { label: "0R to 1R", min: 0, max: 1 },
    { label: "1R to 2R", min: 1, max: 2 },
    { label: "2R to 3R", min: 2, max: 3 },
    { label: "3R+", min: 3, max: Number.POSITIVE_INFINITY },
  ] as const;

  const counts = new Map(ranges.map((range) => [range.label, 0]));

  trades.forEach((trade) => {
    const rr = toNumber(trade.rrRatio);
    const range = ranges.find((item) => rr >= item.min && rr < item.max);
    if (!range) return;

    counts.set(range.label, (counts.get(range.label) ?? 0) + 1);
  });

  return ranges.map((range) => ({
    range: range.label,
    count: counts.get(range.label) ?? 0,
  }));
}

export async function getEmotionPerformance(
  userId: string,
  filters?: AnalyticsFilters
): Promise<EmotionPerformance[]> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    select: { emotionBefore: true, pnl: true },
  });

  const emotionMap = new Map<string, { wins: number; total: number; pnl: number }>();
  trades.forEach((trade) => {
    const current = emotionMap.get(trade.emotionBefore) || {
      wins: 0,
      total: 0,
      pnl: 0,
    };
    current.total++;
    current.pnl += toNumber(trade.pnl);
    if (toNumber(trade.pnl) > 0) current.wins++;
    emotionMap.set(trade.emotionBefore, current);
  });

  return Array.from(emotionMap.entries()).map(([emotion, data]) => ({
    emotion,
    winRate: (data.wins / data.total) * 100,
    avgPnl: data.pnl / data.total,
    trades: data.total,
  }));
}

export async function getMistakeAnalysis(
  userId: string,
  filters?: AnalyticsFilters
): Promise<MistakeAnalysis[]> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    include: { mistakes: true },
  });

  const mistakeMap = new Map<string, { count: number; totalLoss: number }>();
  trades.forEach((trade) => {
    trade.mistakes.forEach((m) => {
      const current = mistakeMap.get(m.mistake) || { count: 0, totalLoss: 0 };
      current.count++;
      const pnl = toNumber(trade.pnl);
      if (pnl < 0) {
        current.totalLoss += pnl;
      }
      mistakeMap.set(m.mistake, current);
    });
  });

  return Array.from(mistakeMap.entries()).map(([mistake, data]) => ({
    mistake,
    count: data.count,
    totalLoss: data.totalLoss,
    avgLoss: data.count > 0 ? data.totalLoss / data.count : 0,
  }));
}

export async function getMistakesOverTime(
  userId: string,
  filters?: AnalyticsFilters
): Promise<MistakesOverTime[]> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    include: { mistakes: true },
    orderBy: { date: "asc" },
  });

  const periodMap = new Map<string, { count: number; totalLoss: number }>();

  trades.forEach((trade) => {
    if (trade.mistakes.length === 0) return;
    const hasMistake = trade.mistakes.some((m) => m.mistake !== "NO_MISTAKE");
    if (!hasMistake) return;

    const date = new Date(trade.date);
    const periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const current = periodMap.get(periodKey) ?? { count: 0, totalLoss: 0 };

    const mistakeCount = trade.mistakes.filter((m) => m.mistake !== "NO_MISTAKE").length;
    current.count += mistakeCount;

    const pnl = toNumber(trade.pnl);
    if (pnl < 0) {
      current.totalLoss += pnl;
    }

    periodMap.set(periodKey, current);
  });

  return Array.from(periodMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodKey, data]) => {
      const [year, month] = periodKey.split("-");
      const date = new Date(Number(year), Number(month) - 1, 1);

      return {
        period: date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        count: data.count,
        totalLoss: data.totalLoss,
      };
    })
    .slice(-12);
}

export async function getTradesByMistake(
  userId: string,
  mistake: string,
  filters?: AnalyticsFilters
): Promise<TradeByMistake[]> {
  const trades = await prisma.trade.findMany({
    where: {
      ...buildTradeWhere(userId, filters),
      mistakes: {
        some: {
          mistake: mistake as import("@prisma/client").MistakeType,
        },
      },
    },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      instrument: true,
      direction: true,
      pnl: true,
    },
    take: 20,
  });

  return trades.map((trade) => ({
    id: trade.id,
    date: trade.date,
    instrument: trade.instrument,
    direction: trade.direction,
    pnl: toNumber(trade.pnl),
    mistake,
  }));
}

export async function getSessionPerformance(
  userId: string,
  filters?: AnalyticsFilters
): Promise<SessionPerformance[]> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    select: { session: true, pnl: true, rrRatio: true },
  });

  const sessionOrder: TradeSession[] = ["ASIAN", "LONDON", "NEW_YORK", "LONDON_NEW_YORK_OVERLAP"];
  const sessionMap = new Map(
    sessionOrder.map((session) => [session, { wins: 0, total: 0, pnl: 0, rrSum: 0, rrCount: 0, winPnl: 0, lossPnl: 0 }])
  );

  trades.forEach((trade) => {
    const current = sessionMap.get(trade.session);
    if (!current) return;

    const pnl = toNumber(trade.pnl);
    const rr = toNumber(trade.rrRatio);
    
    current.total += 1;
    current.pnl += pnl;
    if (pnl > 0) {
      current.wins += 1;
      current.winPnl += pnl;
    } else if (pnl < 0) {
      current.lossPnl += Math.abs(pnl);
    }
    if (rr !== 0) {
      current.rrSum += rr;
      current.rrCount += 1;
    }
  });

  return sessionOrder.map((session) => {
    const data = sessionMap.get(session) ?? { wins: 0, total: 0, pnl: 0, rrSum: 0, rrCount: 0, winPnl: 0, lossPnl: 0 };
    const profitFactor = data.lossPnl > 0 ? data.winPnl / data.lossPnl : data.winPnl > 0 ? 999 : 0;
    
    return {
      session,
      trades: data.total,
      winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
      totalPnl: data.pnl,
      averageRR: data.rrCount > 0 ? data.rrSum / data.rrCount : 0,
      profitFactor: profitFactor === Infinity ? 999 : profitFactor,
    };
  });
}

export async function getConfidencePerformance(
  userId: string,
  filters?: AnalyticsFilters
): Promise<ConfidencePerformance[]> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    select: { confidenceBefore: true, pnl: true },
  });

  const confidenceMap = new Map<number, { wins: number; total: number; pnl: number }>();
  
  for (let i = 1; i <= 10; i++) {
    confidenceMap.set(i, { wins: 0, total: 0, pnl: 0 });
  }

  trades.forEach((trade) => {
    const confidence = trade.confidenceBefore;
    const current = confidenceMap.get(confidence);
    if (!current) return;

    const pnl = toNumber(trade.pnl);
    current.total += 1;
    current.pnl += pnl;
    if (pnl > 0) current.wins += 1;
  });

  return Array.from(confidenceMap.entries())
    .map(([confidence, data]) => ({
      confidence,
      trades: data.total,
      winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
      avgPnl: data.total > 0 ? data.pnl / data.total : 0,
      totalPnl: data.pnl,
    }))
    .filter((item) => item.trades > 0);
}

export async function getEmotionComparison(
  userId: string,
  filters?: AnalyticsFilters
): Promise<EmotionComparison[]> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    select: { emotionBefore: true, emotionAfter: true, pnl: true },
  });

  const comparisonMap = new Map<string, { wins: number; total: number; pnl: number }>();

  trades.forEach((trade) => {
    const key = `${trade.emotionBefore}|${trade.emotionAfter ?? "NONE"}`;
    const current = comparisonMap.get(key) ?? { wins: 0, total: 0, pnl: 0 };

    const pnl = toNumber(trade.pnl);
    current.total += 1;
    current.pnl += pnl;
    if (pnl > 0) current.wins += 1;

    comparisonMap.set(key, current);
  });

  return Array.from(comparisonMap.entries())
    .map(([key, data]) => {
      const [emotionBefore, emotionAfter] = key.split("|");
      return {
        emotionBefore,
        emotionAfter: emotionAfter === "NONE" ? null : emotionAfter,
        trades: data.total,
        winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
        avgPnl: data.total > 0 ? data.pnl / data.total : 0,
      };
    })
    .sort((a, b) => b.trades - a.trades);
}

export async function getFollowedPlanImpact(
  userId: string,
  filters?: AnalyticsFilters
): Promise<FollowedPlanImpact[]> {
  const trades = await prisma.trade.findMany({
    where: buildTradeWhere(userId, filters),
    select: { followedPlan: true, pnl: true },
  });

  const impactMap = new Map<string, { wins: number; total: number; pnl: number }>();
  impactMap.set("true", { wins: 0, total: 0, pnl: 0 });
  impactMap.set("false", { wins: 0, total: 0, pnl: 0 });
  impactMap.set("null", { wins: 0, total: 0, pnl: 0 });

  trades.forEach((trade) => {
    const key = trade.followedPlan === null ? "null" : String(trade.followedPlan);
    const current = impactMap.get(key);
    if (!current) return;

    const pnl = toNumber(trade.pnl);
    current.total += 1;
    current.pnl += pnl;
    if (pnl > 0) current.wins += 1;
  });

  return Array.from(impactMap.entries())
    .map(([key, data]) => ({
      followedPlan: key === "null" ? null : key === "true",
      trades: data.total,
      winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
      avgPnl: data.total > 0 ? data.pnl / data.total : 0,
      totalPnl: data.pnl,
    }))
    .filter((item) => item.trades > 0);
}

export async function getInsights(userId: string, filters?: AnalyticsFilters): Promise<Insight[]> {
  const [emotionData, confidenceData, followedPlanData] = await Promise.all([
    getEmotionPerformance(userId, filters),
    getConfidencePerformance(userId, filters),
    getFollowedPlanImpact(userId, filters),
  ]);
  
  const insights: Insight[] = [];

  if (emotionData.length > 0) {
    const best = emotionData.reduce((a, b) =>
      a.winRate > b.winRate ? a : b
    );
    const worst = emotionData.reduce((a, b) =>
      a.winRate < b.winRate ? a : b
    );

    if (best.trades >= 3) {
      insights.push({
        type: "emotion",
        headline: `Your ${best.emotion.toLowerCase()} trades perform best`,
        stat: `${best.winRate.toFixed(1)}% win rate`,
        recommendation: `Try to trade more when feeling ${best.emotion.toLowerCase()}`,
        severity: "positive",
      });
    }

    if (worst.trades >= 3 && worst.winRate < 40) {
      insights.push({
        type: "emotion",
        headline: `${worst.emotion.toLowerCase()} trades are hurting you`,
        stat: `${worst.winRate.toFixed(1)}% win rate`,
        recommendation: `Consider avoiding trades when feeling ${worst.emotion.toLowerCase()}`,
        severity: "warning",
      });
    }
  }

  if (confidenceData.length >= 2) {
    const highConfidence = confidenceData.filter((c) => c.confidence >= 7);
    const lowConfidence = confidenceData.filter((c) => c.confidence <= 4);
    
    const highTrades = highConfidence.reduce((sum, c) => sum + c.trades, 0);
    const highWins = highConfidence.reduce((sum, c) => sum + (c.winRate * c.trades / 100), 0);
    const highWinRate = highTrades > 0 ? (highWins / highTrades) * 100 : 0;
    
    const lowTrades = lowConfidence.reduce((sum, c) => sum + c.trades, 0);
    const lowWins = lowConfidence.reduce((sum, c) => sum + (c.winRate * c.trades / 100), 0);
    const lowWinRate = lowTrades > 0 ? (lowWins / lowTrades) * 100 : 0;

    if (highTrades >= 3 && highWinRate > lowWinRate + 10) {
      insights.push({
        type: "confidence",
        headline: "High confidence trades outperform",
        stat: `${highWinRate.toFixed(1)}% vs ${lowWinRate.toFixed(1)}%`,
        recommendation: "Trust your high-conviction setups more",
        severity: "positive",
      });
    }

    if (lowTrades >= 3 && lowWinRate > highWinRate + 10) {
      insights.push({
        type: "confidence",
        headline: "Low confidence trades surprisingly profitable",
        stat: `${lowWinRate.toFixed(1)}% win rate`,
        recommendation: "You may be underestimating your edge",
        severity: "neutral",
      });
    }

    if (highTrades >= 3 && highWinRate < 40) {
      insights.push({
        type: "confidence",
        headline: "Overconfidence may be hurting you",
        stat: `${highWinRate.toFixed(1)}% win rate on high-confidence trades`,
        recommendation: "Review your criteria for high-conviction setups",
        severity: "warning",
      });
    }
  }

  const followedTrue = followedPlanData.find((f) => f.followedPlan === true);
  const followedFalse = followedPlanData.find((f) => f.followedPlan === false);

  if (followedTrue && followedFalse && followedTrue.trades >= 3 && followedFalse.trades >= 3) {
    const diff = followedTrue.winRate - followedFalse.winRate;
    
    if (diff > 15) {
      insights.push({
        type: "setup",
        headline: "Following your plan pays off",
        stat: `+${diff.toFixed(1)}% win rate difference`,
        recommendation: "Stick to your trading plan for better results",
        severity: "positive",
      });
    }
    
    if (diff < -10) {
      insights.push({
        type: "setup",
        headline: "Your improvised trades are working",
        stat: `${followedFalse.winRate.toFixed(1)}% win rate`,
        recommendation: "Consider updating your trading plan",
        severity: "neutral",
      });
    }
  }

  return insights;
}
