import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  const minimumFractionDigits = options.minimumFractionDigits ?? 2;
  const maximumFractionDigits =
    options.maximumFractionDigits ?? Math.max(2, minimumFractionDigits);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    ...options,
    minimumFractionDigits: Math.min(
      minimumFractionDigits,
      maximumFractionDigits
    ),
    maximumFractionDigits,
  }).format(value);
}

export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function formatRR(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}R`;
}

export function getPnLColor(pnl: number): string {
  if (pnl > 0) return "text-success";
  if (pnl < 0) return "text-destructive";
  return "text-muted-foreground";
}

export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    A_PLUS: "bg-success/20 text-success border-success/30",
    A: "bg-success/15 text-success border-success/20",
    B: "bg-accent/15 text-accent border-accent/20",
    C: "bg-muted text-muted-foreground border-muted-foreground/20",
    FOMO: "bg-destructive/15 text-destructive border-destructive/20",
  };
  return colors[grade] || colors.C;
}

export function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    CALM: "bg-success/15 text-success",
    FOCUSED: "bg-accent/15 text-accent",
    EXCITED: "bg-yellow-500/15 text-yellow-500",
    FEARFUL: "bg-orange-500/15 text-orange-500",
    REVENGE: "bg-destructive/15 text-destructive",
    FOMO: "bg-destructive/15 text-destructive",
  };
  return colors[emotion] || "bg-muted text-muted-foreground";
}

export function formatGrade(grade: string): string {
  const labels: Record<string, string> = {
    A_PLUS: "A+",
    A: "A",
    B: "B",
    C: "C",
    FOMO: "FOMO",
  };
  return labels[grade] || grade;
}

export function formatEmotion(emotion: string): string {
  return emotion.charAt(0) + emotion.slice(1).toLowerCase();
}

export function formatSetup(setup: string): string {
  return setup
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatDirection(direction: string): string {
  return direction.charAt(0) + direction.slice(1).toLowerCase();
}

export function formatMistake(mistake: string): string {
  return mistake
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatSession(session: string): string {
  const labels: Record<string, string> = {
    ASIAN: "Asian",
    LONDON: "London",
    NEW_YORK: "New York",
    LONDON_NEW_YORK_OVERLAP: "London-NY Overlap",
  };
  return labels[session] || session;
}

export function formatDayOfWeek(day: string): string {
  return day.charAt(0) + day.slice(1).toLowerCase();
}

export function formatQuantity(value: number): string {
  if (value >= 1) {
    return value % 1 === 0 ? value.toString() : value.toFixed(2);
  }
  const str = value.toString();
  const decimals = str.includes(".") ? str.split(".")[1].length : 0;
  return value.toFixed(Math.max(decimals, 2));
}

export function getSessionColor(session: string): string {
  const colors: Record<string, string> = {
    ASIAN: "bg-purple-500/15 text-purple-500",
    LONDON: "bg-blue-500/15 text-blue-500",
    NEW_YORK: "bg-green-500/15 text-green-500",
    LONDON_NEW_YORK_OVERLAP: "bg-amber-500/15 text-amber-500",
  };
  return colors[session] || "bg-muted text-muted-foreground";
}
