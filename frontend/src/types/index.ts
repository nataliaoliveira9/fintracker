export interface Currency {
  code: string;
  name: string;
}

export interface ConversionResult {
  success: boolean;
  query: { from: string; to: string; amount: number };
  info: { rate: number };
  result: number;
  date?: string;
}

export interface StockSearchResult {
  symbol: string;
  instrument_name: string;
  exchange: string;
  mic_code: string;
  exchange_timezone: string;
  instrument_type: string;
  country: string;
  currency: string;
}

export interface CandlestickBar {
  datetime: string;
  open: string;
  high: string;
  close: string;
  low: string;
  volume: string;
}

export interface TimeSeriesResponse {
  meta: {
    symbol: string;
    interval: string;
    currency: string;
    exchange_timezone: string;
    exchange: string;
    mic_code: string;
    type: string;
  };
  values: CandlestickBar[];
  status: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  previous_close: string;
  change: string;
  percent_change: string;
  is_market_open: boolean;
  fifty_two_week: {
    low: string;
    high: string;
    range: string;
  };
}
