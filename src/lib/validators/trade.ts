import { z } from "zod";
import { MARKETS } from "@/types";

const emptyToUndefined = (value: unknown) => {
  if (value === "" || value === null) {
    return undefined;
  }

  return value;
};

const isValidScreenshotPath = (value: string) => {
  if (value.startsWith("/")) {
    return true;
  }

  return z.string().url().safeParse(value).success;
};

export const tradeSchema = z.object({
  date: z.coerce.date(),
  market: z.enum(MARKETS),
  instrument: z.string().min(1, "Instrument is required"),
  direction: z.enum(["LONG", "SHORT"]),
  session: z.enum(["ASIAN", "LONDON", "NEW_YORK", "LONDON_NEW_YORK_OVERLAP"]),

  entryPrice: z.coerce.number().positive("Entry price must be positive"),
  exitPrice: z.coerce.number().positive("Exit price must be positive"),
  stopLoss: z.preprocess(
    emptyToUndefined,
    z.coerce.number().positive().optional()
  ),
  target: z.preprocess(
    emptyToUndefined,
    z.coerce.number().positive().optional()
  ),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  contractSize: z.preprocess(
    emptyToUndefined,
    z.coerce.number().positive().optional()
  ),

  setup: z.enum([
    "BREAKOUT",
    "PULLBACK",
    "VWAP_BOUNCE",
    "REVERSAL",
    "TREND_CONTINUATION",
    "SUPPORT_RESISTANCE",
    "ORB",
    "SCALPING",
    "CUSTOM",
  ]),
  customSetup: z.preprocess(emptyToUndefined, z.string().optional()),
  grade: z.enum(["A_PLUS", "A", "B", "C", "FOMO"]),

  confidenceBefore: z.coerce.number().min(1).max(10),
  emotionBefore: z.enum(["CALM", "FOCUSED", "EXCITED", "FEARFUL", "REVENGE", "FOMO"]),
  followedPlan: z.boolean().optional().nullable(),
  emotionAfter: z.preprocess(
    emptyToUndefined,
    z
      .enum(["CALM", "FOCUSED", "EXCITED", "FEARFUL", "REVENGE", "FOMO"])
      .optional()
  ),
  confidenceAfter: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(1).max(10).optional()
  ),

  mistakes: z.array(
    z.enum([
      "FOMO_ENTRY",
      "REVENGE_TRADE",
      "EARLY_EXIT",
      "LATE_ENTRY",
      "IGNORED_STOP_LOSS",
      "OVER_TRADING",
      "NO_MISTAKE",
    ])
  ).default([]),

  tradeThesis: z.preprocess(emptyToUndefined, z.string().optional()),
  whyEntered: z.preprocess(emptyToUndefined, z.string().optional()),
  whatWentRight: z.preprocess(emptyToUndefined, z.string().optional()),
  whatWentWrong: z.preprocess(emptyToUndefined, z.string().optional()),
  lessonsLearned: z.preprocess(emptyToUndefined, z.string().optional()),

  screenshotBefore: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine(isValidScreenshotPath, "Invalid screenshot URL")
      .optional()
  ),
  screenshotAfter: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine(isValidScreenshotPath, "Invalid screenshot URL")
      .optional()
  ),
});

export type TradeInput = z.infer<typeof tradeSchema>;

export const tradeFilterSchema = z.object({
  search: z.string().nullish().transform(val => val || undefined),
  direction: z.enum(["LONG", "SHORT"]).nullish().transform(val => val || undefined),
  setup: z.string().nullish().transform(val => val || undefined),
  grade: z.string().nullish().transform(val => val || undefined),
  session: z.enum(["ASIAN", "LONDON", "NEW_YORK", "LONDON_NEW_YORK_OVERLAP"]).nullish().transform(val => val || undefined),
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]).nullish().transform(val => val || undefined),
  startDate: z.coerce.date().nullish().transform(val => val || undefined),
  endDate: z.coerce.date().nullish().transform(val => val || undefined),
  page: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().default(1)
  ),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().default(20)
  ),
});

export type TradeFilter = z.infer<typeof tradeFilterSchema>;

export const analyticsFilterSchema = z.object({
  session: z.enum(["ASIAN", "LONDON", "NEW_YORK", "LONDON_NEW_YORK_OVERLAP"]).nullish().transform(val => val || undefined),
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]).nullish().transform(val => val || undefined),
  startDate: z.coerce.date().nullish().transform(val => val || undefined),
  endDate: z.coerce.date().nullish().transform(val => val || undefined),
});

export type AnalyticsFilter = z.infer<typeof analyticsFilterSchema>;
