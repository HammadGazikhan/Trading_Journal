"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: number;
  format?: "currency" | "percent" | "number" | "rr";
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend?: "positive" | "negative" | "neutral";
  description?: string;
}

export function KpiCard({
  title,
  value,
  format = "number",
  prefix,
  suffix,
  icon: Icon,
  trend = "neutral",
  description,
}: KpiCardProps) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (val) => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case "percent":
        return `${val.toFixed(1)}%`;
      case "rr":
        return `${val >= 0 ? "+" : ""}${val.toFixed(2)}R`;
      default:
        return val.toFixed(val % 1 === 0 ? 0 : 2);
    }
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  const glowClass =
    trend === "positive"
      ? "glow-success"
      : trend === "negative"
        ? "glow-destructive"
        : "glow-accent";

  const iconBgClass =
    trend === "positive"
      ? "bg-success/20 text-success"
      : trend === "negative"
        ? "bg-destructive/20 text-destructive"
        : "bg-accent/20 text-accent";

  const valueClass =
    trend === "positive"
      ? "text-success"
      : trend === "negative"
        ? "text-destructive"
        : "text-foreground";

  return (
    <GlassCard className={cn("p-6", glowClass)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1">
            {prefix && (
              <span className={cn("text-2xl font-bold", valueClass)}>
                {prefix}
              </span>
            )}
            <motion.span
              className={cn("text-3xl font-bold font-mono", valueClass)}
            >
              {display}
            </motion.span>
            {suffix && (
              <span className={cn("text-lg font-medium", valueClass)}>
                {suffix}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconBgClass)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </GlassCard>
  );
}
