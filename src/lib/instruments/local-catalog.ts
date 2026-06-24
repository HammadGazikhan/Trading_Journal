import type { Market } from "@/types";
import type { InstrumentDefinition } from "./types";

function forex(
  symbol: string,
  name: string,
  assetClass = "Currency Pair"
): InstrumentDefinition {
  return { symbol, name, market: "Forex", assetClass };
}

function crypto(symbol: string, name: string): InstrumentDefinition {
  return { symbol, name, market: "Crypto", assetClass: "Cryptocurrency" };
}

function index(symbol: string, name: string, assetClass = "Index"): InstrumentDefinition {
  return { symbol, name, market: "Indices", assetClass };
}

function stock(symbol: string, name: string): InstrumentDefinition {
  return { symbol, name, market: "Stocks", assetClass: "Equity" };
}

function commodity(symbol: string, name: string, assetClass: string): InstrumentDefinition {
  return { symbol, name, market: "Commodities", assetClass };
}

function future(symbol: string, name: string, assetClass: string): InstrumentDefinition {
  return { symbol, name, market: "Futures", assetClass };
}

function option(symbol: string, name: string): InstrumentDefinition {
  return { symbol, name, market: "Options", assetClass: "Option" };
}

const FOREX_INSTRUMENTS: InstrumentDefinition[] = [
  forex("XAUUSD", "Gold / US Dollar", "Precious Metal"),
  forex("XAGUSD", "Silver / US Dollar", "Precious Metal"),
  forex("EURUSD", "Euro / US Dollar"),
  forex("GBPUSD", "British Pound / US Dollar"),
  forex("USDJPY", "US Dollar / Japanese Yen"),
  forex("AUDUSD", "Australian Dollar / US Dollar"),
  forex("NZDUSD", "New Zealand Dollar / US Dollar"),
  forex("USDCAD", "US Dollar / Canadian Dollar"),
  forex("USDCHF", "US Dollar / Swiss Franc"),
  forex("EURGBP", "Euro / British Pound"),
  forex("EURJPY", "Euro / Japanese Yen"),
  forex("GBPJPY", "British Pound / Japanese Yen"),
  forex("AUDJPY", "Australian Dollar / Japanese Yen"),
  forex("EURAUD", "Euro / Australian Dollar"),
  forex("EURCHF", "Euro / Swiss Franc"),
  forex("CADJPY", "Canadian Dollar / Japanese Yen"),
];

const CRYPTO_INSTRUMENTS: InstrumentDefinition[] = [
  crypto("BTCUSD", "Bitcoin / US Dollar"),
  crypto("ETHUSD", "Ethereum / US Dollar"),
  crypto("SOLUSD", "Solana / US Dollar"),
  crypto("BNBUSD", "BNB / US Dollar"),
  crypto("XRPUSD", "Ripple / US Dollar"),
  crypto("DOGEUSD", "Dogecoin / US Dollar"),
  crypto("ADAUSD", "Cardano / US Dollar"),
  crypto("AVAXUSD", "Avalanche / US Dollar"),
  crypto("DOTUSD", "Polkadot / US Dollar"),
  crypto("LINKUSD", "Chainlink / US Dollar"),
  crypto("MATICUSD", "Polygon / US Dollar"),
  crypto("LTCUSD", "Litecoin / US Dollar"),
];

const INDICES_INSTRUMENTS: InstrumentDefinition[] = [
  index("NAS100", "NASDAQ 100", "US Index"),
  index("US30", "Dow Jones 30", "US Index"),
  index("SPX500", "S&P 500", "US Index"),
  index("GER40", "DAX 40", "European Index"),
  index("UK100", "FTSE 100", "European Index"),
  index("JPN225", "Nikkei 225", "Asian Index"),
  index("AUS200", "ASX 200", "Asia-Pacific Index"),
  index("FRA40", "CAC 40", "European Index"),
  index("EU50", "Euro Stoxx 50", "European Index"),
];

const STOCK_INSTRUMENTS: InstrumentDefinition[] = [
  stock("AAPL", "Apple Inc."),
  stock("TSLA", "Tesla Inc."),
  stock("NVDA", "NVIDIA Corporation"),
  stock("MSFT", "Microsoft Corporation"),
  stock("AMZN", "Amazon.com Inc."),
  stock("META", "Meta Platforms Inc."),
  stock("GOOGL", "Alphabet Inc. Class A"),
  stock("GOOG", "Alphabet Inc. Class C"),
  stock("NFLX", "Netflix Inc."),
  stock("AMD", "Advanced Micro Devices"),
  stock("INTC", "Intel Corporation"),
  stock("CRM", "Salesforce Inc."),
  stock("ORCL", "Oracle Corporation"),
  stock("ADBE", "Adobe Inc."),
  stock("AVGO", "Broadcom Inc."),
  stock("QCOM", "Qualcomm Inc."),
  stock("TXN", "Texas Instruments"),
  stock("MU", "Micron Technology"),
  stock("COIN", "Coinbase Global"),
  stock("PLTR", "Palantir Technologies"),
  stock("SHOP", "Shopify Inc."),
  stock("SQ", "Block Inc."),
  stock("PYPL", "PayPal Holdings"),
  stock("V", "Visa Inc."),
  stock("MA", "Mastercard Inc."),
  stock("JPM", "JPMorgan Chase"),
  stock("BAC", "Bank of America"),
  stock("GS", "Goldman Sachs"),
  stock("WMT", "Walmart Inc."),
  stock("COST", "Costco Wholesale"),
  stock("HD", "Home Depot"),
  stock("NKE", "Nike Inc."),
  stock("DIS", "Walt Disney Company"),
  stock("BA", "Boeing Company"),
  stock("XOM", "Exxon Mobil"),
  stock("CVX", "Chevron Corporation"),
  stock("PFE", "Pfizer Inc."),
  stock("JNJ", "Johnson & Johnson"),
  stock("UNH", "UnitedHealth Group"),
  stock("LLY", "Eli Lilly"),
  stock("MRK", "Merck & Co."),
  stock("ABBV", "AbbVie Inc."),
  stock("SPY", "SPDR S&P 500 ETF"),
  stock("QQQ", "Invesco QQQ Trust"),
  stock("IWM", "iShares Russell 2000 ETF"),
  stock("ARKK", "ARK Innovation ETF"),
  stock("SMCI", "Super Micro Computer"),
  stock("ARM", "Arm Holdings"),
  stock("UBER", "Uber Technologies"),
  stock("ABNB", "Airbnb Inc."),
];

const COMMODITY_INSTRUMENTS: InstrumentDefinition[] = [
  commodity("XAUUSD", "Gold", "Precious Metal"),
  commodity("XAGUSD", "Silver", "Precious Metal"),
  commodity("USOIL", "WTI Crude Oil", "Energy"),
  commodity("UKOIL", "Brent Crude Oil", "Energy"),
  commodity("NATGAS", "Natural Gas", "Energy"),
  commodity("COPPER", "Copper", "Industrial Metal"),
  commodity("PLATINUM", "Platinum", "Precious Metal"),
  commodity("PALLADIUM", "Palladium", "Precious Metal"),
  commodity("WHEAT", "Wheat", "Agriculture"),
  commodity("CORN", "Corn", "Agriculture"),
  commodity("SOYBEAN", "Soybeans", "Agriculture"),
];

const FUTURES_INSTRUMENTS: InstrumentDefinition[] = [
  future("ES", "E-mini S&P 500", "Equity Index Future"),
  future("NQ", "E-mini NASDAQ 100", "Equity Index Future"),
  future("YM", "E-mini Dow Jones", "Equity Index Future"),
  future("RTY", "E-mini Russell 2000", "Equity Index Future"),
  future("CL", "Crude Oil WTI", "Energy Future"),
  future("NG", "Natural Gas", "Energy Future"),
  future("GC", "Gold", "Metal Future"),
  future("SI", "Silver", "Metal Future"),
  future("HG", "Copper", "Metal Future"),
  future("ZB", "30-Year T-Bond", "Interest Rate Future"),
  future("ZN", "10-Year T-Note", "Interest Rate Future"),
  future("6E", "Euro FX", "Currency Future"),
  future("6J", "Japanese Yen", "Currency Future"),
  future("6B", "British Pound", "Currency Future"),
];

const OPTIONS_INSTRUMENTS: InstrumentDefinition[] = [
  option("SPY", "SPDR S&P 500 ETF Options"),
  option("QQQ", "Invesco QQQ Options"),
  option("AAPL", "Apple Options"),
  option("TSLA", "Tesla Options"),
  option("NVDA", "NVIDIA Options"),
  option("AMD", "AMD Options"),
  option("META", "Meta Options"),
  option("AMZN", "Amazon Options"),
  option("GOOGL", "Alphabet Options"),
  option("IWM", "Russell 2000 ETF Options"),
];

export const INSTRUMENT_CATALOG: InstrumentDefinition[] = [
  ...FOREX_INSTRUMENTS,
  ...CRYPTO_INSTRUMENTS,
  ...INDICES_INSTRUMENTS,
  ...STOCK_INSTRUMENTS,
  ...COMMODITY_INSTRUMENTS,
  ...FUTURES_INSTRUMENTS,
  ...OPTIONS_INSTRUMENTS,
];

export const INSTRUMENTS_BY_MARKET: Record<Market, InstrumentDefinition[]> = {
  Forex: FOREX_INSTRUMENTS,
  Crypto: CRYPTO_INSTRUMENTS,
  Indices: INDICES_INSTRUMENTS,
  Stocks: STOCK_INSTRUMENTS,
  Commodities: COMMODITY_INSTRUMENTS,
  Futures: FUTURES_INSTRUMENTS,
  Options: OPTIONS_INSTRUMENTS,
};
