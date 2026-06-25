"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  TrendingUp,
  TrendingDown,
  Calculator,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { GlassCard } from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useTradeModalStore } from "@/stores/trade-modal-store";
import { tradeSchema, type TradeInput } from "@/lib/validators/trade";
import { calculateTradeMetrics } from "@/lib/calculations/trade-metrics";
import { formatCurrency, formatRR, formatDayOfWeek, cn } from "@/lib/utils";
import {
  resolveContractSize,
  getContractSizeLabel,
} from "@/lib/calculations/contract-size";
import { deriveDayOfWeek } from "@/lib/calculations/day-of-week";
import { MarketInstrumentSelector } from "@/components/trade/market-instrument-selector";
import { instrumentService } from "@/lib/instruments/instrument-service";
import {
  TRADE_DIRECTIONS,
  TRADE_GRADES,
  EMOTIONS,
  MISTAKES,
  SETUPS,
  MARKETS,
  TRADE_SESSIONS,
  type TradeWithMistakes,
} from "@/types";

interface AddTradeModalProps {
  onSuccess?: () => void;
}

const DEFAULT_MARKET = MARKETS[0];
const DEFAULT_SESSION = "NEW_YORK" as const;
const DEFAULT_SETUP = "BREAKOUT" as const;

type MarketOption = (typeof MARKETS)[number];
type SessionOption = (typeof TRADE_SESSIONS)[number]["value"];
type SetupOption = (typeof SETUPS)[number]["value"];

function isMarketOption(
  value: string | null | undefined,
): value is MarketOption {
  return MARKETS.includes(value as MarketOption);
}

function isSessionOption(
  value: string | null | undefined,
): value is SessionOption {
  return TRADE_SESSIONS.some((session) => session.value === value);
}

function isSetupOption(value: string | null | undefined): value is SetupOption {
  return SETUPS.some((setup) => setup.value === value);
}

function getMarketValue(market: string | null | undefined): MarketOption {
  return isMarketOption(market) ? market : DEFAULT_MARKET;
}

function getSessionValue(session: string | null | undefined): SessionOption {
  return isSessionOption(session) ? session : DEFAULT_SESSION;
}

function getSetupValue(setup: string | null | undefined): SetupOption {
  return isSetupOption(setup) ? setup : DEFAULT_SETUP;
}

function getDefaultTradeValues() {
  return {
    date: new Date(),
    market: DEFAULT_MARKET,
    session: DEFAULT_SESSION,
    direction: "LONG" as const,
    setup: DEFAULT_SETUP,
    grade: "B" as const,
    confidenceBefore: 5,
    emotionBefore: "CALM" as const,
    mistakes: [],
    screenshotBefore: undefined,
    screenshotAfter: undefined,
    contractSize: undefined,
  };
}

function getTradeFormValues(trade: TradeWithMistakes) {
  return {
    ...getDefaultTradeValues(),
    date: new Date(trade.date),
    market: getMarketValue(trade.market),
    session: getSessionValue(trade.session),
    instrument: trade.instrument,
    direction: trade.direction,
    entryPrice: Number(trade.entryPrice),
    exitPrice: Number(trade.exitPrice),
    stopLoss:
      trade.stopLoss !== null && trade.stopLoss !== undefined
        ? Number(trade.stopLoss)
        : undefined,
    target:
      trade.target !== null && trade.target !== undefined
        ? Number(trade.target)
        : undefined,
    quantity: Number(trade.quantity),
    contractSize:
      trade.contractSize !== null && trade.contractSize !== undefined
        ? Number(trade.contractSize)
        : undefined,
    setup: getSetupValue(trade.setup),
    customSetup: trade.customSetup ?? undefined,
    grade: trade.grade,
    confidenceBefore: trade.confidenceBefore,
    emotionBefore: trade.emotionBefore,
    followedPlan: trade.followedPlan ?? undefined,
    emotionAfter: trade.emotionAfter ?? undefined,
    confidenceAfter: trade.confidenceAfter ?? undefined,
    mistakes: trade.mistakes.map((m) => m.mistake),
    tradeThesis: trade.tradeThesis ?? undefined,
    whyEntered: trade.whyEntered ?? undefined,
    whatWentRight: trade.whatWentRight ?? undefined,
    whatWentWrong: trade.whatWentWrong ?? undefined,
    lessonsLearned: trade.lessonsLearned ?? undefined,
    screenshotBefore: trade.screenshotBefore ?? undefined,
    screenshotAfter: trade.screenshotAfter ?? undefined,
  };
}

interface TradeModalContentProps {
  editingTrade: TradeWithMistakes | null;
  onClose: () => void;
  onSuccess?: () => void;
}

function TradeModalContent({
  editingTrade,
  onClose,
  onSuccess,
}: TradeModalContentProps) {
  const [uploading, setUploading] = useState({ before: false, after: false });
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TradeInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: standardSchemaResolver(tradeSchema) as any,
    defaultValues: editingTrade
      ? getTradeFormValues(editingTrade)
      : getDefaultTradeValues(),
  });

  const watchedValues = watch();

  const effectiveContractSize = useMemo(() => {
    if (watchedValues.contractSize != null && watchedValues.contractSize > 0) {
      return watchedValues.contractSize;
    }
    return resolveContractSize(
      watchedValues.market,
      watchedValues.instrument ?? "",
    );
  }, [
    watchedValues.contractSize,
    watchedValues.market,
    watchedValues.instrument,
  ]);

  const derivedDayOfWeek = useMemo(() => {
    if (!watchedValues.date) return null;
    return deriveDayOfWeek(watchedValues.date);
  }, [watchedValues.date]);

  const calculations = useMemo(() => {
    if (
      watchedValues.entryPrice == null ||
      watchedValues.entryPrice <= 0 ||
      watchedValues.exitPrice == null ||
      watchedValues.exitPrice <= 0 ||
      watchedValues.quantity == null ||
      watchedValues.quantity <= 0 ||
      !watchedValues.direction
    ) {
      return null;
    }
    return calculateTradeMetrics({
      direction: watchedValues.direction,
      entryPrice: watchedValues.entryPrice,
      exitPrice: watchedValues.exitPrice,
      stopLoss: watchedValues.stopLoss,
      target: watchedValues.target,
      quantity: watchedValues.quantity,
      contractSize: effectiveContractSize,
    });
  }, [
    watchedValues.direction,
    watchedValues.entryPrice,
    watchedValues.exitPrice,
    watchedValues.stopLoss,
    watchedValues.target,
    watchedValues.quantity,
    effectiveContractSize,
  ]);

  const onSubmit = async (data: TradeInput) => {
    try {
      const url = editingTrade
        ? `/api/trades/${editingTrade.id}`
        : "/api/trades";
      const method = editingTrade ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onClose();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Failed to save trade:", error);
    }
  };

  const uploadScreenshot = async (file: File, type: "before" | "after") => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file.");
      return;
    }

    setUploadError(null);
    setUploading((current) => ({ ...current, [type]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Upload failed");
      }

      const { url } = (await response.json()) as { url: string };
      const fieldName =
        type === "before" ? "screenshotBefore" : "screenshotAfter";

      setValue(fieldName, url, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      console.error("Failed to upload screenshot:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Screenshot upload failed. Please try again.",
      );
    } finally {
      setUploading((current) => ({ ...current, [type]: false }));
    }
  };

  const clearScreenshot = (type: "before" | "after") => {
    const fieldName =
      type === "before" ? "screenshotBefore" : "screenshotAfter";
    setValue(fieldName, undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">
            {editingTrade ? "Edit Trade" : "Add New Trade"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Trade Information */}
            <Section title="Trade Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label>Date & Time</Label>
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.date && (
                    <p className="text-xs text-destructive">
                      {errors.date.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Controller
                  name="market"
                  control={control}
                  render={({ field: marketField }) => (
                    <Controller
                      name="instrument"
                      control={control}
                      render={({ field: instrumentField }) => (
                        <MarketInstrumentSelector
                          market={marketField.value ?? DEFAULT_MARKET}
                          instrument={instrumentField.value ?? ""}
                          onMarketChange={(newMarket) => {
                            marketField.onChange(newMarket);
                            const currentInstrument =
                              instrumentField.value ?? "";
                            if (
                              currentInstrument &&
                              !instrumentService.getInstrument(
                                currentInstrument,
                                newMarket,
                              )
                            ) {
                              instrumentField.onChange("");
                            }
                          }}
                          onInstrumentChange={instrumentField.onChange}
                          marketError={errors.market?.message}
                          instrumentError={errors.instrument?.message}
                        />
                      )}
                    />
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Direction</Label>
                  <Controller
                    name="direction"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-3">
                        {TRADE_DIRECTIONS.map((dir) => (
                          <Button
                            key={dir.value}
                            type="button"
                            variant={
                              field.value === dir.value ? "default" : "outline"
                            }
                            className={cn(
                              "h-10 gap-2 rounded-[4px]",
                              field.value === dir.value && dir.value === "LONG"
                                ? "bg-success hover:bg-success/90"
                                : field.value === dir.value &&
                                    dir.value === "SHORT"
                                  ? "bg-destructive hover:bg-destructive/90"
                                  : "",
                            )}
                            onClick={() => field.onChange(dir.value)}
                          >
                            {dir.value === "LONG" ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {dir.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Session</Label>
                  <Controller
                    name="session"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? DEFAULT_SESSION}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select session" />
                        </SelectTrigger>
                        <SelectContent>
                          {TRADE_SESSIONS.map((session) => (
                            <SelectItem
                              key={session.value}
                              value={session.value}
                            >
                              {session.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.session && (
                    <p className="text-xs text-destructive">
                      {errors.session.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <div className="h-10 flex items-center px-3 rounded-[4px] border border-border bg-muted/50 text-sm text-muted-foreground">
                    {derivedDayOfWeek
                      ? formatDayOfWeek(derivedDayOfWeek)
                      : "Select date"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Auto-derived from date
                  </p>
                </div>
              </div>
            </Section>

            {/* Entry Information + Live Calculations */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 items-start">
              <Section title="Entry Information">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entryPrice">Entry Price</Label>
                    <Input
                      id="entryPrice"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      {...register("entryPrice")}
                    />
                    {errors.entryPrice && (
                      <p className="text-xs text-destructive">
                        {errors.entryPrice.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exitPrice">Exit Price</Label>
                    <Input
                      id="exitPrice"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      {...register("exitPrice")}
                    />
                    {errors.exitPrice && (
                      <p className="text-xs text-destructive">
                        {errors.exitPrice.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Lots / Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="any"
                      placeholder="0.01"
                      {...register("quantity")}
                    />
                    {errors.quantity && (
                      <p className="text-xs text-destructive">
                        {errors.quantity.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stopLoss">Stop Loss</Label>
                    <Input
                      id="stopLoss"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      {...register("stopLoss")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target">Target</Label>
                    <Input
                      id="target"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      {...register("target")}
                    />
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <Label
                      htmlFor="contractSize"
                      className="text-sm font-medium"
                    >
                      Contract Size (Advanced)
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {getContractSizeLabel(effectiveContractSize)}
                    </span>
                  </div>
                  <Input
                    id="contractSize"
                    type="number"
                    step="any"
                    placeholder={String(effectiveContractSize)}
                    {...register("contractSize")}
                    className="h-9"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to auto-detect from instrument. Override for
                    non-standard lot sizes.
                  </p>
                </div>
              </Section>

              <LiveCalculationsPanel
                calculations={calculations}
                effectiveContractSize={effectiveContractSize}
              />
            </div>

            {/* Setup & Grade */}
            <Section title="Setup & Grade">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Setup</Label>
                  <Controller
                    name="setup"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? DEFAULT_SETUP}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SETUPS.map((setup) => (
                            <SelectItem key={setup.value} value={setup.value}>
                              {setup.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grade</Label>
                  <Controller
                    name="grade"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-2">
                        {TRADE_GRADES.map((grade) => (
                          <Button
                            key={grade.value}
                            type="button"
                            variant={
                              field.value === grade.value
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => field.onChange(grade.value)}
                          >
                            {grade.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  />
                </div>
              </div>
            </Section>

            {/* Psychology */}
            <Section title="Psychology">
              <Tabs defaultValue="before">
                <TabsList>
                  <TabsTrigger value="before">Before Trade</TabsTrigger>
                  <TabsTrigger value="after">After Trade</TabsTrigger>
                </TabsList>
                <TabsContent value="before" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Emotion Before</Label>
                    <Controller
                      name="emotionBefore"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-wrap gap-2">
                          {EMOTIONS.map((emotion) => (
                            <Button
                              key={emotion.value}
                              type="button"
                              variant={
                                field.value === emotion.value
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => field.onChange(emotion.value)}
                            >
                              {emotion.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Confidence: {watchedValues.confidenceBefore}/10
                    </Label>
                    <Controller
                      name="confidenceBefore"
                      control={control}
                      render={({ field }) => (
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                        />
                      )}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="after" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Emotion After</Label>
                    <Controller
                      name="emotionAfter"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-wrap gap-2">
                          {EMOTIONS.map((emotion) => (
                            <Button
                              key={emotion.value}
                              type="button"
                              variant={
                                field.value === emotion.value
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => field.onChange(emotion.value)}
                            >
                              {emotion.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Confidence After: {watchedValues.confidenceAfter ?? 5}/10
                    </Label>
                    <Controller
                      name="confidenceAfter"
                      control={control}
                      render={({ field }) => (
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value ?? 5]}
                          onValueChange={(v) => field.onChange(v[0])}
                        />
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Controller
                      name="followedPlan"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label>Followed my trading plan</Label>
                  </div>
                </TabsContent>
              </Tabs>
            </Section>

            {/* Mistakes */}
            <Section title="Mistakes">
              <Controller
                name="mistakes"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {MISTAKES.map((mistake) => {
                      const isSelected = field.value.includes(mistake.value);
                      return (
                        <Button
                          key={mistake.value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={
                            isSelected
                              ? mistake.value === "NO_MISTAKE"
                                ? "bg-success hover:bg-success/90"
                                : "bg-destructive hover:bg-destructive/90"
                              : ""
                          }
                          onClick={() => {
                            if (isSelected) {
                              field.onChange(
                                field.value.filter((m) => m !== mistake.value),
                              );
                            } else {
                              field.onChange([...field.value, mistake.value]);
                            }
                          }}
                        >
                          {mistake.label}
                        </Button>
                      );
                    })}
                  </div>
                )}
              />
            </Section>

            {/* Notes */}
            <Section title="Notes">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tradeThesis">Trade Thesis</Label>
                  <textarea
                    id="tradeThesis"
                    className="w-full min-h-[80px] rounded-[4px] border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Why did you take this trade?"
                    {...register("tradeThesis")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatWentRight">What Went Right</Label>
                    <textarea
                      id="whatWentRight"
                      className="w-full min-h-[60px] rounded-[4px] border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      {...register("whatWentRight")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatWentWrong">What Went Wrong</Label>
                    <textarea
                      id="whatWentWrong"
                      className="w-full min-h-[60px] rounded-[4px] border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      {...register("whatWentWrong")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonsLearned">Lessons Learned</Label>
                  <textarea
                    id="lessonsLearned"
                    className="w-full min-h-[60px] rounded-[4px] border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    {...register("lessonsLearned")}
                  />
                </div>
              </div>
            </Section>

            <Section title="Screenshots">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <ScreenshotUploadCard
                    inputId="screenshot-before"
                    title="Before Trade Screenshot"
                    imageUrl={watchedValues.screenshotBefore}
                    isUploading={uploading.before}
                    onUpload={(file) => uploadScreenshot(file, "before")}
                    onRemove={() => clearScreenshot("before")}
                  />
                  <ScreenshotUploadCard
                    inputId="screenshot-after"
                    title="After Trade Screenshot"
                    imageUrl={watchedValues.screenshotAfter}
                    isUploading={uploading.after}
                    onUpload={(file) => uploadScreenshot(file, "after")}
                    onRemove={() => clearScreenshot("after")}
                  />
                </div>
                {uploadError && (
                  <p className="text-sm text-destructive">{uploadError}</p>
                )}
              </div>
            </Section>
          </form>
        </ScrollArea>

        {/* Footer */}
        <div className="flex shrink-2 items-center justify-end gap-3 border-t border-border bg-card px-6 py-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 min-w-[108px] font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="h-10 min-w-[132px] gap-2 font-semibold"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {editingTrade ? "Update Trade" : "Save Trade"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AddTradeModal({ onSuccess }: AddTradeModalProps) {
  const { isOpen, editingTrade, closeModal } = useTradeModalStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <TradeModalContent
          key={editingTrade?.id ?? "new"}
          editingTrade={editingTrade}
          onClose={closeModal}
          onSuccess={onSuccess}
        />
      )}
    </AnimatePresence>
  );
}

function LiveCalculationsPanel({
  calculations,
  effectiveContractSize,
}: {
  calculations: ReturnType<typeof calculateTradeMetrics> | null;
  effectiveContractSize?: number;
}) {
  return (
    <GlassCard className="p-5 xl:sticky xl:top-0">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Live Calculations</h3>
      </div>
      {calculations ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Profit/Loss</p>
            <p
              className={cn(
                "text-2xl xl:text-3xl font-bold font-mono",
                calculations.pnl >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {formatCurrency(calculations.pnl)}
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Risk</p>
              <p className="text-lg font-mono">
                {calculations.risk ? formatCurrency(calculations.risk) : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reward</p>
              <p className="text-lg font-mono">
                {calculations.reward
                  ? formatCurrency(calculations.reward)
                  : "N/A"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Risk/Reward Ratio</p>
            <p
              className={cn(
                "text-xl xl:text-2xl font-bold font-mono",
                calculations.rrRatio && calculations.rrRatio >= 1
                  ? "text-success"
                  : "text-destructive",
              )}
            >
              {formatRR(calculations.rrRatio)}
            </p>
          </div>
          {effectiveContractSize && effectiveContractSize !== 1 && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Using contract size: {effectiveContractSize.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Enter entry, exit, and quantity to see calculations
        </p>
      )}
    </GlassCard>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function ScreenshotUploadCard({
  inputId,
  title,
  imageUrl,
  isUploading,
  onUpload,
  onRemove,
}: {
  inputId: string;
  title: string;
  imageUrl?: string;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    onUpload(file);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{title}</Label>
      <label
        htmlFor={inputId}
        className={cn(
          "group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-surface/50 p-4 text-center transition-colors",
          "hover:border-primary/40 hover:bg-surface",
        )}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFiles(event.dataTransfer.files);
        }}
      >
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />

        {imageUrl ? (
          <div className="w-full space-y-3">
            <img
              src={imageUrl}
              alt={title}
              className="h-36 w-full rounded-lg border border-white/5 object-cover"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Click or drop another image to replace
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onRemove();
                }}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {isUploading ? (
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            ) : (
              <ImagePlus className="mx-auto h-8 w-8 text-primary" />
            )}
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                {isUploading
                  ? "Uploading screenshot..."
                  : "Drop image here or click to browse"}
              </p>
              <p className="text-sm text-muted-foreground">
                PNG, JPG, WEBP up to your browser upload limit
              </p>
            </div>
          </div>
        )}
      </label>
    </div>
  );
}
