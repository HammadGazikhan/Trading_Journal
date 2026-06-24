"use client";

import { useMemo } from "react";
import {
  calculateTradeMetrics,
  type TradeMetricsInput,
  type TradeMetricsOutput,
} from "@/lib/calculations/trade-metrics";

export function useTradeCalculations(
  input: Partial<TradeMetricsInput>
): TradeMetricsOutput | null {
  return useMemo(() => {
    if (
      !input.direction ||
      input.entryPrice == null ||
      input.entryPrice <= 0 ||
      input.exitPrice == null ||
      input.exitPrice <= 0 ||
      input.quantity == null ||
      input.quantity <= 0
    ) {
      return null;
    }

    return calculateTradeMetrics({
      direction: input.direction,
      entryPrice: input.entryPrice,
      exitPrice: input.exitPrice,
      stopLoss: input.stopLoss,
      target: input.target,
      quantity: input.quantity,
      contractSize: input.contractSize,
    });
  }, [
    input.direction,
    input.entryPrice,
    input.exitPrice,
    input.stopLoss,
    input.target,
    input.quantity,
    input.contractSize,
  ]);
}
