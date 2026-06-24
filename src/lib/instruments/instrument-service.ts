import type { Market } from "@/types";
import { INSTRUMENT_CATALOG, INSTRUMENTS_BY_MARKET } from "./local-catalog";
import type {
  InstrumentDataSource,
  InstrumentDefinition,
  InstrumentSearchOptions,
} from "./types";

function normalize(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function matchesQuery(instrument: InstrumentDefinition, query: string): boolean {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;

  const candidates = [
    instrument.symbol,
    instrument.name,
    ...(instrument.aliases ?? []),
  ];

  return candidates.some((candidate) =>
    normalize(candidate).includes(normalizedQuery)
  );
}

function highlightMatch(text: string, query: string): { text: string; match: boolean }[] {
  if (!query.trim()) {
    return [{ text, match: false }];
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return [{ text, match: false }];
  }

  return [
    { text: text.slice(0, index), match: false },
    { text: text.slice(index, index + query.length), match: true },
    { text: text.slice(index + query.length), match: false },
  ].filter((part) => part.text.length > 0);
}

class LocalInstrumentDataSource implements InstrumentDataSource {
  getInstrumentsByMarket(market: Market): InstrumentDefinition[] {
    return INSTRUMENTS_BY_MARKET[market] ?? [];
  }

  searchInstruments({
    market,
    query = "",
    limit = 50,
  }: InstrumentSearchOptions): InstrumentDefinition[] {
    return this.getInstrumentsByMarket(market)
      .filter((instrument) => matchesQuery(instrument, query))
      .slice(0, limit);
  }

  getInstrument(symbol: string, market?: Market): InstrumentDefinition | null {
    const normalizedSymbol = normalize(symbol);
    const pool = market
      ? this.getInstrumentsByMarket(market)
      : INSTRUMENT_CATALOG;

    return (
      pool.find((instrument) => normalize(instrument.symbol) === normalizedSymbol) ??
      null
    );
  }
}

const localDataSource = new LocalInstrumentDataSource();

/**
 * Single entry point for instrument lookups.
 * Swap `instrumentService` implementation when integrating external APIs.
 */
export const instrumentService: InstrumentDataSource = localDataSource;

export { highlightMatch, normalize as normalizeInstrumentSymbol };
