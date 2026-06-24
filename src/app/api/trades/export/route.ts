import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trades = await prisma.trade.findMany({
      where: { userId: session.user.id },
      include: { mistakes: true },
      orderBy: { date: "desc" },
    });

    // Generate CSV
    const headers = [
      "Date",
      "Day",
      "Session",
      "Instrument",
      "Market",
      "Direction",
      "Entry Price",
      "Exit Price",
      "Stop Loss",
      "Target",
      "Quantity",
      "Contract Size",
      "P&L",
      "RR Ratio",
      "Setup",
      "Grade",
      "Emotion Before",
      "Confidence Before",
      "Followed Plan",
      "Mistakes",
      "Notes",
    ];

    const rows = trades.map((trade) => [
      new Date(trade.date).toISOString().split("T")[0],
      trade.dayOfWeek,
      trade.session,
      trade.instrument,
      trade.market || "",
      trade.direction,
      trade.entryPrice.toString(),
      trade.exitPrice.toString(),
      trade.stopLoss?.toString() || "",
      trade.target?.toString() || "",
      trade.quantity.toString(),
      trade.contractSize.toString(),
      trade.pnl.toString(),
      trade.rrRatio?.toString() || "",
      trade.setup,
      trade.grade,
      trade.emotionBefore,
      trade.confidenceBefore.toString(),
      trade.followedPlan === null ? "" : trade.followedPlan ? "Yes" : "No",
      trade.mistakes.map((m) => m.mistake).join("; "),
      trade.tradeThesis || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="trades-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Failed to export trades:", error);
    return NextResponse.json(
      { error: "Failed to export trades" },
      { status: 500 }
    );
  }
}
