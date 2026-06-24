import { PrismaClient, type MistakeType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@tradingjournal.com";
const DEMO_PASSWORD = "Demo123!";

const stockInstruments = ["AAPL", "MSFT", "TSLA", "GOOGL", "AMZN", "SPY", "QQQ", "NVDA", "META", "AMD"];
const forexInstruments = ["XAUUSD", "EURUSD", "GBPUSD", "USDJPY"];
const setups = [
  "BREAKOUT",
  "PULLBACK",
  "VWAP_BOUNCE",
  "REVERSAL",
  "TREND_CONTINUATION",
  "SUPPORT_RESISTANCE",
  "ORB",
  "SCALPING",
] as const;
const grades = ["A_PLUS", "A", "B", "C", "FOMO"] as const;
const emotions = ["CALM", "FOCUSED", "EXCITED", "FEARFUL", "REVENGE", "FOMO"] as const;
const lossMistakes = [
  "FOMO_ENTRY",
  "REVENGE_TRADE",
  "EARLY_EXIT",
  "LATE_ENTRY",
  "IGNORED_STOP_LOSS",
  "OVER_TRADING",
] as const;
const directions = ["LONG", "SHORT"] as const;
const sessions = ["ASIAN", "LONDON", "NEW_YORK", "LONDON_NEW_YORK_OVERLAP"] as const;
const daysOfWeek = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getDayOfWeek(date: Date): (typeof daysOfWeek)[number] {
  return daysOfWeek[date.getDay()];
}

function getContractSize(market: string, instrument: string): number {
  const normalizedInstrument = instrument.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (normalizedInstrument === "XAUUSD" || normalizedInstrument === "GOLD") {
    return 100;
  }
  if (normalizedInstrument === "XAGUSD" || normalizedInstrument === "SILVER") {
    return 5000;
  }
  if (market === "Forex" && !normalizedInstrument.includes("XAU") && !normalizedInstrument.includes("XAG")) {
    return 100000;
  }
  return 1;
}

function pickMistakes(pnl: number): MistakeType[] {
  if (pnl >= 0) {
    return Math.random() > 0.35 ? ["NO_MISTAKE"] : [];
  }

  const count = Math.random() > 0.7 ? 2 : 1;
  const picked = new Set<MistakeType>();

  while (picked.size < count) {
    picked.add(randomFrom(lossMistakes));
  }

  return Array.from(picked);
}

function buildTrade(
  userId: string,
  date: Date,
  market: string,
  instrument: string,
  quantity: number
) {
  const direction = randomFrom(directions);
  let basePrice: number;
  let priceMove: number;
  let stopDistance: number;
  let targetDistance: number;

  if (instrument === "XAUUSD") {
    basePrice = randomBetween(2600, 2700);
    priceMove = randomBetween(5, 20);
    stopDistance = randomBetween(5, 15);
    targetDistance = randomBetween(10, 30);
  } else if (instrument === "USDJPY") {
    basePrice = randomBetween(145, 155);
    priceMove = randomBetween(0.2, 1);
    stopDistance = randomBetween(0.3, 0.8);
    targetDistance = randomBetween(0.5, 1.5);
  } else if (market === "Forex") {
    basePrice = randomBetween(1.05, 1.35);
    priceMove = randomBetween(0.002, 0.01);
    stopDistance = randomBetween(0.003, 0.008);
    targetDistance = randomBetween(0.005, 0.015);
  } else {
    basePrice = randomBetween(100, 500);
    priceMove = randomBetween(0.5, 5);
    stopDistance = randomBetween(1, 3);
    targetDistance = randomBetween(2, 6);
  }

  const entryPrice = basePrice;
  const isWin = Math.random() > 0.42;
  const exitPrice =
    direction === "LONG"
      ? basePrice + (isWin ? priceMove : -priceMove)
      : basePrice + (isWin ? -priceMove : priceMove);

  const contractSize = getContractSize(market, instrument);
  const stopLoss =
    direction === "LONG" ? basePrice - stopDistance : basePrice + stopDistance;
  const target =
    direction === "LONG" ? basePrice + targetDistance : basePrice - targetDistance;

  const pnl =
    direction === "LONG"
      ? (exitPrice - entryPrice) * quantity * contractSize
      : (entryPrice - exitPrice) * quantity * contractSize;

  const risk = Math.abs(entryPrice - stopLoss) * quantity * contractSize;
  const reward = Math.abs(target - entryPrice) * quantity * contractSize;
  const rrRatio = risk > 0 ? pnl / risk : 0;

  const emotionBefore = randomFrom(emotions);
  const followedPlan = Math.random() > 0.28;
  const confidenceBefore = Math.floor(randomBetween(2, 10));
  const confidenceAfter = Math.floor(
    randomBetween(
      isWin ? Math.max(4, confidenceBefore - 1) : Math.min(6, confidenceBefore),
      isWin ? 10 : confidenceBefore + 1
    )
  );

  const emotionAfter = isWin
    ? randomFrom(["CALM", "FOCUSED", "EXCITED"] as const)
    : randomFrom(["FEARFUL", "REVENGE", "FOMO", "CALM"] as const);

  const grade = isWin
    ? randomFrom(["A_PLUS", "A", "B"] as const)
    : randomFrom(["B", "C", "FOMO"] as const);

  return {
    userId,
    date,
    market,
    instrument,
    direction,
    session: randomFrom(sessions),
    dayOfWeek: getDayOfWeek(date),
    entryPrice,
    exitPrice,
    stopLoss,
    target,
    quantity,
    contractSize,
    pnl,
    risk,
    reward,
    rrRatio,
    setup: randomFrom(setups),
    grade,
    confidenceBefore,
    emotionBefore,
    followedPlan,
    emotionAfter,
    confidenceAfter,
    tradeThesis: `Identified ${randomFrom(["bullish", "bearish"])} setup on ${instrument}`,
    whyEntered: randomFrom([
      "Clear entry signal",
      "Volume confirmation",
      "Trend continuation pattern",
    ]),
    whatWentRight: isWin ? "Held to plan and managed risk well" : null,
    whatWentWrong: !isWin ? "Poor timing or emotional decision" : null,
    lessonsLearned: randomFrom([
      "Trust the process",
      "Stick to the plan",
      "Wait for confirmation",
    ]),
    mistakes: pickMistakes(pnl),
  };
}

async function clearDemoData(userId: string) {
  await prisma.tradeMistake.deleteMany({
    where: { trade: { userId } },
  });
  await prisma.trade.deleteMany({ where: { userId } });
  await prisma.playbook.deleteMany({ where: { userId } });
  await prisma.aiInsight.deleteMany({ where: { userId } });
}

async function main() {
  console.log("Seeding demo data...\n");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: "Demo Trader", passwordHash },
    create: {
      email: DEMO_EMAIL,
      name: "Demo Trader",
      passwordHash,
    },
  });

  await clearDemoData(user.id);
  console.log("Cleared previous demo trades/playbooks");

  const now = new Date();
  const trades = [];
  const forexLotSizes = [0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1];

  // 90 days of history for monthly charts + reports
  for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
    const tradesToday = Math.random() > 0.35 ? (Math.random() > 0.75 ? 2 : 1) : 0;
    if (tradesToday === 0) continue;

    for (let i = 0; i < tradesToday; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      date.setHours(Math.floor(randomBetween(2, 22)));
      date.setMinutes(Math.floor(randomBetween(0, 59)));

      const isForex = Math.random() > 0.45;
      const instrument = isForex ? randomFrom(forexInstruments) : randomFrom(stockInstruments);
      const market = isForex ? "Forex" : "Stocks";
      const quantity = isForex
        ? randomFrom(forexLotSizes)
        : Math.floor(randomBetween(10, 100));

      trades.push(buildTrade(user.id, date, market, instrument, quantity));
    }
  }

  // Guarantee recent data for weekly/monthly reports
  for (let i = 0; i < 8; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(randomBetween(0, 6)));
    date.setHours(Math.floor(randomBetween(9, 16)));
    trades.push(
      buildTrade(
        user.id,
        date,
        "Stocks",
        randomFrom(stockInstruments),
        Math.floor(randomBetween(20, 80))
      )
    );
  }

  for (const trade of trades) {
    const { mistakes, ...tradeData } = trade;

    const createdTrade = await prisma.trade.create({ data: tradeData });

    for (const mistake of mistakes) {
      await prisma.tradeMistake.create({
        data: {
          tradeId: createdTrade.id,
          mistake,
        },
      });
    }
  }

  await prisma.playbook.createMany({
    data: [
      {
        userId: user.id,
        name: "Opening Range Breakout",
        description: "Trade breakouts from the first 15-30 minute range",
        conditions: "Market opens with gap < 1%, wait for first 15-30 min range to form",
        entryRules: "Enter on break of range high (long) or low (short) with volume confirmation",
        exitRules: "Target 1:2 RR minimum, trail stop after 1R profit",
        riskRules: "Max 1% account risk per trade, max 2 ORB trades per day",
      },
      {
        userId: user.id,
        name: "VWAP Bounce",
        description: "Trade bounces off VWAP in trending days",
        conditions: "Clear trend established, price pulls back to VWAP",
        entryRules: "Enter on bounce from VWAP with candle confirmation",
        exitRules: "Target previous high/low, stop below VWAP",
        riskRules: "Only trade with trend, max risk 0.5%",
      },
      {
        userId: user.id,
        name: "London Breakout",
        description: "Capture momentum during London open",
        conditions: "Asian range is tight, London session shows expansion",
        entryRules: "Enter on break of Asian high/low with momentum candle",
        exitRules: "Scale out at 1R, move stop to breakeven",
        riskRules: "Risk 0.75% per trade, no more than 3 attempts per session",
      },
    ],
  });

  const wins = trades.filter((t) => t.pnl > 0).length;

  console.log(`Created ${trades.length} demo trades`);
  console.log(`Created 3 sample playbooks`);
  console.log(`Win rate: ${((wins / trades.length) * 100).toFixed(1)}%`);
  console.log("\nSeeding complete!\n");
  console.log("Login with:");
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log("\nPages to test:");
  console.log("  /dashboard   - KPIs + charts");
  console.log("  /journal     - trade list + edit/delete");
  console.log("  /analytics   - 10 charts");
  console.log("  /psychology  - confidence + followed-plan insights");
  console.log("  /mistakes    - trends + drill-down");
  console.log("  /playbook    - setup cards + modal CRUD");
  console.log("  /reports     - weekly/monthly preview + print");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
