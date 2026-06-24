import type { Market } from "@/types";

interface ContractSizeRule {
  pattern: RegExp;
  contractSize: number;
}

const instrumentRules: ContractSizeRule[] = [
  { pattern: /^(XAUUSD|GOLD)$/i, contractSize: 100 },
  { pattern: /^(XAGUSD|SILVER)$/i, contractSize: 5000 },
  { pattern: /^(XPTUSD|PLATINUM)$/i, contractSize: 100 },
  { pattern: /^(XPDUSD|PALLADIUM)$/i, contractSize: 100 },
  { pattern: /^[A-Z]{6}$/i, contractSize: 100000 },
];

const marketDefaults: Record<string, number> = {
  Stocks: 1,
  Crypto: 1,
  Options: 1,
  Futures: 1,
  Indices: 1,
  Commodities: 1,
  Forex: 100000,
};

function normalizeInstrument(instrument: string): string {
  return instrument.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function resolveContractSize(
  market: string | null | undefined,
  instrument: string
): number {
  const normalizedInstrument = normalizeInstrument(instrument);

  for (const rule of instrumentRules) {
    if (rule.pattern.test(normalizedInstrument)) {
      return rule.contractSize;
    }
  }

  if (market && market in marketDefaults) {
    return marketDefaults[market];
  }

  return 1;
}

export function getContractSizeLabel(contractSize: number): string {
  if (contractSize === 1) {
    return "1 unit per lot";
  }
  if (contractSize === 100) {
    return "100 oz per lot (Gold)";
  }
  if (contractSize === 5000) {
    return "5000 oz per lot (Silver)";
  }
  if (contractSize === 100000) {
    return "100,000 units per lot (Forex)";
  }
  return `${contractSize.toLocaleString()} units per lot`;
}
