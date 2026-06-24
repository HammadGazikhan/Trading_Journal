import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import {
  getDashboardMetrics,
  getSetupPerformance,
  getMistakeAnalysis,
  getInsights,
  getSessionPerformance,
  getDayPerformance,
} from "@/lib/analytics/aggregator";

function toNumber(value: Decimal | number | null): number {
  if (value === null) return 0;
  return typeof value === "number" ? value : value.toNumber();
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "weekly";

    const now = new Date();
    const startDate = new Date();
    if (period === "weekly") {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }

    const dateFilters = { startDate, endDate: now };

    const trades = await prisma.trade.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate, lte: now },
      },
      include: { mistakes: true },
      orderBy: { pnl: "desc" },
    });

    const [metrics, setupPerformance, mistakeAnalysis, insights, sessionPerformance, dayPerformance] = await Promise.all([
      getDashboardMetrics(session.user.id, dateFilters),
      getSetupPerformance(session.user.id, dateFilters),
      getMistakeAnalysis(session.user.id, dateFilters),
      getInsights(session.user.id, dateFilters),
      getSessionPerformance(session.user.id, dateFilters),
      getDayPerformance(session.user.id, dateFilters),
    ]);

    const totalPnl = trades.reduce((sum, t) => sum + toNumber(t.pnl), 0);
    const wins = trades.filter((t) => toNumber(t.pnl) > 0).length;

    const bestSetup = setupPerformance.length > 0
      ? setupPerformance.reduce((a, b) => (a.winRate > b.winRate ? a : b))
      : null;

    const biggestMistake = mistakeAnalysis
      .filter((m) => m.mistake !== "NO_MISTAKE")
      .reduce((a, b) => (Math.abs(a.totalLoss) > Math.abs(b.totalLoss) ? a : b), mistakeAnalysis[0]);

    const bestSession = sessionPerformance.filter(s => s.trades > 0).length > 0
      ? sessionPerformance.filter(s => s.trades > 0).reduce((a, b) => (a.winRate > b.winRate ? a : b))
      : null;

    const bestDay = dayPerformance.filter(d => d.trades > 0).length > 0
      ? dayPerformance.filter(d => d.trades > 0).reduce((a, b) => (a.winRate > b.winRate ? a : b))
      : null;

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      totalTrades: trades.length,
      winRate: trades.length > 0 ? (wins / trades.length) * 100 : 0,
      totalPnl,
      bestTrade: trades[0] || null,
      worstTrade: trades[trades.length - 1] || null,
      biggestMistake: biggestMistake || null,
      bestSetup,
      bestSession,
      bestDay,
      sessionPerformance,
      dayPerformance,
      insights,
      metrics,
    });
  } catch (error) {
    console.error("Failed to generate report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
