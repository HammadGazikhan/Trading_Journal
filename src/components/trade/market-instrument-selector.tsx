"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InstrumentCombobox } from "@/components/trade/instrument-combobox";
import { InstrumentInfoCard } from "@/components/trade/instrument-info-card";
import { instrumentService } from "@/lib/instruments/instrument-service";
import { MARKETS, type Market } from "@/types";
import { useMemo } from "react";

interface MarketInstrumentSelectorProps {
  market: Market | undefined;
  instrument: string;
  onMarketChange: (market: Market) => void;
  onInstrumentChange: (instrument: string) => void;
  marketError?: string;
  instrumentError?: string;
  instrumentLoading?: boolean;
}

export function MarketInstrumentSelector({
  market,
  instrument,
  onMarketChange,
  onInstrumentChange,
  marketError,
  instrumentError,
  instrumentLoading = false,
}: MarketInstrumentSelectorProps) {
  const resolvedMarket = market ?? MARKETS[0];

  const selectedInstrument = useMemo(() => {
    if (!instrument) return null;

    const catalogMatch = instrumentService.getInstrument(instrument, resolvedMarket);
    if (catalogMatch) return catalogMatch;

    return {
      symbol: instrument.toUpperCase(),
      name: "Custom symbol",
      market: resolvedMarket,
      assetClass: "Unlisted",
    };
  }, [instrument, resolvedMarket]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="market">Market</Label>
          <Select
            value={resolvedMarket}
            onValueChange={(value) => onMarketChange(value as Market)}
          >
            <SelectTrigger id="market" className="h-10 bg-surface">
              <SelectValue placeholder="Select market" />
            </SelectTrigger>
            <SelectContent>
              {MARKETS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {marketError && (
            <p className="text-xs text-destructive">{marketError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="instrument">Instrument</Label>
          <InstrumentCombobox
            market={resolvedMarket}
            value={instrument}
            onChange={onInstrumentChange}
            loading={instrumentLoading}
            error={instrumentError}
            placeholder={`Search ${resolvedMarket} symbols...`}
          />
        </div>
      </div>

      <InstrumentInfoCard instrument={selectedInstrument} />
    </div>
  );
}
