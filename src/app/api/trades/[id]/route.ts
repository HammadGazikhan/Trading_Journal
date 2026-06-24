import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tradeSchema } from "@/lib/validators/trade";
import { calculateTradeMetrics } from "@/lib/calculations/trade-metrics";
import { deriveDayOfWeek } from "@/lib/calculations/day-of-week";
import { resolveContractSize } from "@/lib/calculations/contract-size";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const trade = await prisma.trade.findFirst({
      where: { id, userId: session.user.id },
      include: { mistakes: true },
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    return NextResponse.json(trade);
  } catch (error) {
    console.error("Failed to fetch trade:", error);
    return NextResponse.json(
      { error: "Failed to fetch trade" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = tradeSchema.parse(body);

    const existing = await prisma.trade.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

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

    await prisma.tradeMistake.deleteMany({ where: { tradeId: id } });

    const trade = await prisma.trade.update({
      where: { id },
      data: {
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

    return NextResponse.json(trade);
  } catch (error) {
    console.error("Failed to update trade:", error);
    return NextResponse.json(
      { error: "Failed to update trade" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.trade.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    await prisma.trade.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete trade:", error);
    return NextResponse.json(
      { error: "Failed to delete trade" },
      { status: 500 }
    );
  }
}
