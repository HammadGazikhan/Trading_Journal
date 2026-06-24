import type {
  Trade,
  Playbook,
  AiInsight,
  TradeMistake,
  TradeDirection,
  TradeGrade,
  Emotion,
  MistakeType,
  SetupType,
  AiInsightType,
  TradeSession,
  DayOfWeek,
} from "@prisma/client";

export type {
  Trade,
  Playbook,
  AiInsight,
  TradeMistake,
  TradeDirection,
  TradeGrade,
  Emotion,
  MistakeType,
  SetupType,
  AiInsightType,
  TradeSession,
  DayOfWeek,
};

export type TradeWithMistakes = Trade & {
  mistakes: TradeMistake[];
};

export interface DashboardMetrics {
  totalPnl: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  averageRR: number;
  currentStreak: number;
  streakType: "win" | "loss" | "none";
}

export interface EquityCurvePoint {
  date: string;
  equity: number;
  pnl: number;
}

export interface DailyPnL {
  date: string;
  pnl: number;
}

export interface WinLossData {
  wins: number;
  losses: number;
  breakeven: number;
}

export interface SetupPerformance {
  setup: string;
  winRate: number;
  totalPnl: number;
  trades: number;
}

export interface DayPerformance {
  day: string;
  winRate: number;
  trades: number;
  pnl: number;
}

export interface MonthlyPerformance {
  month: string;
  winRate: number;
  trades: number;
  pnl: number;
}

export interface TimePerformance {
  label: string;
  winRate: number;
  trades: number;
  avgPnl: number;
}

export interface DirectionPerformance {
  direction: TradeDirection;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  trades: number;
}

export interface EmotionPerformance {
  emotion: string;
  winRate: number;
  avgPnl: number;
  trades: number;
}

export interface MistakeAnalysis {
  mistake: string;
  count: number;
  totalLoss: number;
  avgLoss: number;
}

export interface RRDistribution {
  range: string;
  count: number;
}

export interface Insight {
  type: "emotion" | "confidence" | "mistake" | "setup";
  headline: string;
  stat: string;
  recommendation: string;
  severity: "positive" | "neutral" | "warning";
}

export interface ReportData {
  period: "weekly" | "monthly";
  startDate: string;
  endDate: string;
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  bestTrade: TradeWithMistakes | null;
  worstTrade: TradeWithMistakes | null;
  biggestMistake: MistakeAnalysis | null;
  bestSetup: SetupPerformance | null;
  insights: Insight[];
}

export const TRADE_DIRECTIONS: { value: TradeDirection; label: string }[] = [
  { value: "LONG", label: "Long" },
  { value: "SHORT", label: "Short" },
];

export const TRADE_GRADES: { value: TradeGrade; label: string }[] = [
  { value: "A_PLUS", label: "A+" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "FOMO", label: "FOMO" },
];

export const EMOTIONS: { value: Emotion; label: string }[] = [
  { value: "CALM", label: "Calm" },
  { value: "FOCUSED", label: "Focused" },
  { value: "EXCITED", label: "Excited" },
  { value: "FEARFUL", label: "Fearful" },
  { value: "REVENGE", label: "Revenge" },
  { value: "FOMO", label: "FOMO" },
];

export const MISTAKES: { value: MistakeType; label: string }[] = [
  { value: "FOMO_ENTRY", label: "FOMO Entry" },
  { value: "REVENGE_TRADE", label: "Revenge Trade" },
  { value: "EARLY_EXIT", label: "Early Exit" },
  { value: "LATE_ENTRY", label: "Late Entry" },
  { value: "IGNORED_STOP_LOSS", label: "Ignored Stop Loss" },
  { value: "OVER_TRADING", label: "Over Trading" },
  { value: "NO_MISTAKE", label: "No Mistake" },
];

export const SETUPS: { value: SetupType; label: string }[] = [
  { value: "BREAKOUT", label: "Breakout" },
  { value: "PULLBACK", label: "Pullback" },
  { value: "VWAP_BOUNCE", label: "VWAP Bounce" },
  { value: "REVERSAL", label: "Reversal" },
  { value: "TREND_CONTINUATION", label: "Trend Continuation" },
  { value: "SUPPORT_RESISTANCE", label: "Support/Resistance" },
  { value: "ORB", label: "ORB" },
  { value: "SCALPING", label: "Scalping" },
  { value: "CUSTOM", label: "Custom" },
];

export const MARKETS = [
  "Forex",
  "Crypto",
  "Indices",
  "Stocks",
  "Commodities",
  "Futures",
  "Options",
] as const;

export type Market = (typeof MARKETS)[number];

export const TRADE_SESSIONS: { value: TradeSession; label: string }[] = [
  { value: "ASIAN", label: "Asian" },
  { value: "LONDON", label: "London" },
  { value: "NEW_YORK", label: "New York" },
  { value: "LONDON_NEW_YORK_OVERLAP", label: "London-NY Overlap" },
];

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

export interface SessionPerformance {
  session: string;
  trades: number;
  winRate: number;
  totalPnl: number;
  averageRR: number;
  profitFactor: number;
}

export interface ConfidencePerformance {
  confidence: number;
  trades: number;
  winRate: number;
  avgPnl: number;
  totalPnl: number;
}

export interface EmotionComparison {
  emotionBefore: string;
  emotionAfter: string | null;
  trades: number;
  winRate: number;
  avgPnl: number;
}

export interface FollowedPlanImpact {
  followedPlan: boolean | null;
  trades: number;
  winRate: number;
  avgPnl: number;
  totalPnl: number;
}

export interface MistakesOverTime {
  period: string;
  count: number;
  totalLoss: number;
}

export interface TradeByMistake {
  id: string;
  date: Date;
  instrument: string;
  direction: TradeDirection;
  pnl: number;
  mistake: string;
}
