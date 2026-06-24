"use client";

type TooltipPayloadEntry = {
  value?: number | string;
  name?: string | number;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
};

type TooltipFormatter = (
  value: number,
  name: string,
  dataKey: string
) => [string, string];

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
  formatter?: TooltipFormatter;
}

function getValueClassName(value: number, dataKey: string) {
  if (["pnl", "totalPnl", "avgPnl", "equity"].includes(dataKey)) {
    return value >= 0
      ? "font-semibold text-[#00C853]"
      : "font-semibold text-[#FF5252]";
  }

  return "font-semibold text-[#F8FAFC]";
}

const LABEL_KEYS = [
  "emotionLabel",
  "mistakeLabel",
  "sessionLabel",
  "directionLabel",
  "setupLabel",
  "day",
  "label",
  "emotion",
  "month",
  "range",
  "session",
  "confidence",
] as const;

function resolveTooltipLabel(
  label: ChartTooltipProps["label"],
  payload: ChartTooltipProps["payload"]
) {
  if (label != null && String(label).length > 0) {
    return String(label);
  }

  const item = payload?.[0]?.payload;
  if (!item || typeof item !== "object") return null;

  for (const key of LABEL_KEYS) {
    if (key in item && item[key] != null && String(item[key]).length > 0) {
      return String(item[key]);
    }
  }

  return null;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const displayLabel = resolveTooltipLabel(label, payload);

  return (
    <div className="rounded-lg border border-white/10 bg-[#111827] px-3 py-2 shadow-xl">
      {displayLabel && (
        <p className="mb-1.5 text-sm font-medium text-[#F8FAFC]">{displayLabel}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const value = Number(entry.value);
          const dataKey = String(entry.dataKey ?? entry.name ?? "");
          const name = String(entry.name ?? dataKey);

          const [displayValue, displayName] = formatter
            ? formatter(value, name, dataKey)
            : [String(entry.value), name];

          return (
            <p key={index} className="text-sm">
              <span className="text-[#94A3B8]">{displayName}: </span>
              <span className={getValueClassName(value, dataKey)}>
                {displayValue}
              </span>
            </p>
          );
        })}
      </div>
    </div>
  );
}

export const chartTooltipCursor = { fill: "rgba(255,255,255,0.05)" };
