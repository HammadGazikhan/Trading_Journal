import type { Market } from "@/types";

export interface InstrumentDefinition {
  symbol: string;
  name: string;
  market: Market;
  assetClass: string;
  aliases?: string[];
}

export interface InstrumentSearchOptions {
  market: Market;
  query?: string;
  limit?: number;
}

export interface InstrumentDataSource {
  getInstrumentsByMarket(market: Market): InstrumentDefinition[];
  searchInstruments(options: InstrumentSearchOptions): InstrumentDefinition[];
  getInstrument(symbol: string, market?: Market): InstrumentDefinition | null;
}
