export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

const DAYS_MAP: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export function deriveDayOfWeek(date: Date): DayOfWeek {
  const dayIndex = date.getDay();
  return DAYS_MAP[dayIndex];
}

export function getDayOfWeekOrder(): DayOfWeek[] {
  return [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];
}

export function formatDayOfWeek(day: DayOfWeek | string): string {
  const formatted = day.charAt(0) + day.slice(1).toLowerCase();
  return formatted;
}

export function getDayOfWeekShort(day: DayOfWeek | string): string {
  const map: Record<string, string> = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
  };
  return map[day.toUpperCase()] || day.slice(0, 3);
}
