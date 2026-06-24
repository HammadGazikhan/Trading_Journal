import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tradeSchema, tradeFilterSchema } from "@/lib/validators/trade";
import { calculateTradeMetrics } from "@/lib/calculations/trade-metrics";
import { deriveDayOfWeek } from "@/lib/calculations/day-of-week";
import { resolveContractSize } from "@/lib/calculations/contract-size";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = tradeFilterSchema.parse({
      search: searchParams.get("search"),
      direction: searchParams.get("direction"),
      setup: searchParams.get("setup"),
      grade: searchParams.get("grade"),
      session: searchParams.get("session"),
      dayOfWeek: searchParams.get("dayOfWeek"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (filters.search) {
      where.instrument = { contains: filters.search, mode: "insensitive" };
    }
    if (filters.direction) {
      where.direction = filters.direction;
    }
    if (filters.setup) {
      where.setup = filters.setup;
    }
    if (filters.grade) {
      where.grade = filters.grade;
    }
    if (filters.session) {
      where.session = filters.session;
    }
    if (filters.dayOfWeek) {
      where.dayOfWeek = filters.dayOfWeek;
    }
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        (where.date as Record<string, Date>).gte = filters.startDate;
      }
      if (filters.endDate) {
        (where.date as Record<string, Date>).lte = filters.endDate;
      }
    }

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        include: { mistakes: true },
        orderBy: { date: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.trade.count({ where }),
    ]);

    return NextResponse.json({
      trades,
      total,
      page: filters.page,
      limit: filters.limit,
    });
  } catch (error) {
    console.error("Failed to fetch trades:", error);
    return NextResponse.json(
      { error: "Failed to fetch trades" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = tradeSchema.parse(body);

    const dayOfWeek = deriveDayOfWeek(data.date);
    const contractSize = data.contractSize ?? resolveContractSize(data.market, data.instrument);

    const metrics = calculateTradeMetrics({
      direction: data.direction,
      entryPrice: data.entryPrice,
      exitPrice: data.exitPrice,
      stopLoss: data.stopLoss,
      target: data.target,
      quantity: data.quantity,
      contractSize,
    });

    const trade = await prisma.trade.create({
      data: {
        userId: session.user.id,
        date: data.date,
        market: data.market,
        instrument: data.instrument,
        direction: data.direction,
        session: data.session,
        dayOfWeek,
        entryPrice: data.entryPrice,
        exitPrice: data.exitPrice,
        stopLoss: data.stopLoss,
        target: data.target,
        quantity: data.quantity,
        contractSize,
        pnl: metrics.pnl,
        risk: metrics.risk,
        reward: metrics.reward,
        rrRatio: metrics.rrRatio,
        setup: data.setup,
        customSetup: data.customSetup,
        grade: data.grade,
        confidenceBefore: data.confidenceBefore,
        emotionBefore: data.emotionBefore,
        followedPlan: data.followedPlan,
        emotionAfter: data.emotionAfter,
        confidenceAfter: data.confidenceAfter,
        tradeThesis: data.tradeThesis,
        whyEntered: data.whyEntered,
        whatWentRight: data.whatWentRight,
        whatWentWrong: data.whatWentWrong,
        lessonsLearned: data.lessonsLearned,
        screenshotBefore: data.screenshotBefore,
        screenshotAfter: data.screenshotAfter,
        mistakes: {
          create: data.mistakes.map((mistake) => ({ mistake })),
        },
      },
      include: { mistakes: true },
    });

    return NextResponse.json(trade, { status: 201 });
  } catch (error) {
    console.error("Failed to create trade:", error);
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 }
    );
  }
}
