import { cn } from "@/lib/utils";
import { getGradeColor, getEmotionColor, getSessionColor, formatGrade, formatEmotion, formatSession } from "@/lib/utils";
import type { TradeGrade, Emotion, TradeDirection, TradeSession } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "destructive" | "outline";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  const variants = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-success/15 text-success border-success/20",
    destructive: "bg-destructive/15 text-destructive border-destructive/20",
    outline: "border border-border bg-transparent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function GradeBadge({ grade }: { grade: TradeGrade }) {
  return (
    <Badge className={cn("border", getGradeColor(grade))}>
      {formatGrade(grade)}
    </Badge>
  );
}

export function EmotionBadge({ emotion }: { emotion: Emotion }) {
  return (
    <Badge className={getEmotionColor(emotion)}>{formatEmotion(emotion)}</Badge>
  );
}

export function DirectionBadge({ direction }: { direction: TradeDirection }) {
  const isLong = direction === "LONG";
  return (
    <Badge
      className={cn(
        isLong
          ? "bg-success/15 text-success border-success/20"
          : "bg-destructive/15 text-destructive border-destructive/20"
      )}
    >
      {isLong ? "Long" : "Short"}
    </Badge>
  );
}

export function PnLBadge({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span
      className={cn(
        "font-mono font-medium",
        isPositive ? "text-success" : "text-destructive"
      )}
    >
      {isPositive ? "+" : ""}
      {new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value)}
    </span>
  );
}

export function SessionBadge({ session }: { session: TradeSession }) {
  return (
    <Badge className={getSessionColor(session)}>
      {formatSession(session)}
    </Badge>
  );
}
