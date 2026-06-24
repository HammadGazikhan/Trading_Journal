import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyticsFilterSchema } from "@/lib/validators/trade";
import {
  getDashboardMetrics,
  getFullAnalytics,
  getEquityCurve,
  getDailyPnL,
  getWinLoss,
  getSetupPerformance,
  getDayPerformance,
  getMonthPerformance,
  getTimePerformance,
  getDirectionPerformance,
  getEmotionPerformance,
  getMistakeAnalysis,
  getMistakesOverTime,
  getTradesByMistake,
  getRRDistribution,
  getInsights,
  getSessionPerformance,
  getConfidencePerformance,
  getEmotionComparison,
  getFollowedPlanImpact,
  type AnalyticsFilters,
} from "@/lib/analytics/aggregator";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const metric = searchParams.get("metric");

    const filterParams = analyticsFilterSchema.parse({
      session: searchParams.get("session"),
      dayOfWeek: searchParams.get("dayOfWeek"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    });

    const filters: AnalyticsFilters = {
      session: filterParams.session,
      dayOfWeek: filterParams.dayOfWeek,
      startDate: filterParams.startDate,
      endDate: filterParams.endDate,
    };

    switch (metric) {
      case "dashboard":
        return NextResponse.json(await getDashboardMetrics(session.user.id, filters));

      case "full":
        return NextResponse.json(await getFullAnalytics(session.user.id, filters));

      case "equityCurve":
        return NextResponse.json(await getEquityCurve(session.user.id, filters));

      case "dailyPnl":
        return NextResponse.json(await getDailyPnL(session.user.id, filters));

      case "winLoss":
        return NextResponse.json(await getWinLoss(session.user.id, filters));

      case "setupPerformance":
        return NextResponse.json(await getSetupPerformance(session.user.id, filters));

      case "dayPerformance":
        return NextResponse.json(await getDayPerformance(session.user.id, filters));

      case "monthPerformance":
        return NextResponse.json(await getMonthPerformance(session.user.id, filters));

      case "timePerformance":
        return NextResponse.json(await getTimePerformance(session.user.id, filters));

      case "directionPerformance":
        return NextResponse.json(await getDirectionPerformance(session.user.id, filters));

      case "emotionPerformance":
        return NextResponse.json(await getEmotionPerformance(session.user.id, filters));

      case "mistakeAnalysis":
        return NextResponse.json(await getMistakeAnalysis(session.user.id, filters));

      case "rrDistribution":
        return NextResponse.json(await getRRDistribution(session.user.id, filters));

      case "insights":
        return NextResponse.json(await getInsights(session.user.id, filters));

      case "sessionPerformance":
        return NextResponse.json(await getSessionPerformance(session.user.id, filters));

      case "confidencePerformance":
        return NextResponse.json(await getConfidencePerformance(session.user.id, filters));

      case "emotionComparison":
        return NextResponse.json(await getEmotionComparison(session.user.id, filters));

      case "followedPlanImpact":
        return NextResponse.json(await getFollowedPlanImpact(session.user.id, filters));

      case "mistakesOverTime":
        return NextResponse.json(await getMistakesOverTime(session.user.id, filters));

      case "tradesByMistake": {
        const mistake = searchParams.get("mistake");
        if (!mistake) {
          return NextResponse.json({ error: "Mistake parameter required" }, { status: 400 });
        }
        return NextResponse.json(await getTradesByMistake(session.user.id, mistake, filters));
      }

      default:
        return NextResponse.json(
          { error: "Invalid metric parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
