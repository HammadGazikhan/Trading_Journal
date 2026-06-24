export interface TradeMetricsInput {
  direction: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice: number;
  stopLoss?: number | null;
  target?: number | null;
  quantity: number;
  contractSize?: number;
}

export interface TradeMetricsOutput {
  pnl: number;
  risk: number | null;
  reward: number | null;
  rrRatio: number | null;
  isWin: boolean;
}

export function calculateTradeMetrics(input: TradeMetricsInput): TradeMetricsOutput {
  const {
    direction,
    entryPrice,
    exitPrice,
    stopLoss,
    target,
    quantity,
    contractSize = 1,
  } = input;

  const effectiveSize = quantity * contractSize;

  // Calculate P&L
  let pnl: number;
  if (direction === "LONG") {
    pnl = (exitPrice - entryPrice) * effectiveSize;
  } else {
    pnl = (entryPrice - exitPrice) * effectiveSize;
  }

  // Calculate Risk (based on stop loss)
  let risk: number | null = null;
  if (stopLoss != null && stopLoss > 0) {
    risk = Math.abs(entryPrice - stopLoss) * effectiveSize;
  }

  // Calculate Reward (based on actual exit or target)
  let reward: number | null = null;
  if (target != null && target > 0) {
    reward = Math.abs(target - entryPrice) * effectiveSize;
  } else if (pnl > 0) {
    reward = pnl;
  }

  // Calculate Risk/Reward Ratio
  let rrRatio: number | null = null;
  if (risk != null && risk > 0) {
    rrRatio = pnl / risk;
  }

  return {
    pnl,
    risk,
    reward,
    rrRatio,
    isWin: pnl > 0,
  };
}

export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0;
  return (wins / total) * 100;
}

export function calculateProfitFactor(
  totalWins: number,
  totalLosses: number
): number {
  if (totalLosses === 0) return totalWins > 0 ? Infinity : 0;
  return Math.abs(totalWins / totalLosses);
}

export function calculateExpectancy(
  winRate: number,
  avgWin: number,
  avgLoss: number
): number {
  const winRateDecimal = winRate / 100;
  return winRateDecimal * avgWin - (1 - winRateDecimal) * Math.abs(avgLoss);
}

export function calculateCurrentStreak(
  trades: { pnl: number }[]
): { count: number; type: "win" | "loss" | "none" } {
  if (trades.length === 0) return { count: 0, type: "none" };

  const sortedTrades = [...trades].sort(
    (a, b) => new Date(b.pnl).getTime() - new Date(a.pnl).getTime()
  );

  const firstTrade = sortedTrades[0];
  const isWin = firstTrade.pnl > 0;
  let count = 0;

  for (const trade of sortedTrades) {
    if ((trade.pnl > 0) === isWin) {
      count++;
    } else {
      break;
    }
  }

  return {
    count,
    type: isWin ? "win" : firstTrade.pnl < 0 ? "loss" : "none",
  };
}
