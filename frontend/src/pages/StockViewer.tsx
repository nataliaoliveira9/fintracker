import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
} from 'lightweight-charts';
import { TrendingUp, TrendingDown, Search, Clock, Info, X } from 'lucide-react';
import { stockApi } from '../services/api';
import type { StockQuote, StockSearchResult, CandlestickBar } from '../types';
import './StockViewer.css';

const INTERVALS = [
  { label: '1D', value: '1day', size: 90 },
  { label: '1W', value: '1week', size: 52 },
  { label: '1M', value: '1month', size: 24 },
  { label: '1H', value: '1h', size: 168 },
];

const DEFAULTS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'AMZN'];

const StockViewer: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [interval, setInterval] = useState(INTERVALS[0]);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // Init chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0d1117' },
        textColor: '#8b949e',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#161b22' },
        horzLines: { color: '#161b22' },
      },
      crosshair: {
        vertLine: { color: '#30363d', labelBackgroundColor: '#1c2333' },
        horzLine: { color: '#30363d', labelBackgroundColor: '#1c2333' },
      },
      rightPriceScale: { borderColor: '#21262d' },
      timeScale: { borderColor: '#21262d', timeVisible: true },
      width: chartContainerRef.current.clientWidth,
      height: 380,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#3fb950',
      downColor: '#f85149',
      borderUpColor: '#3fb950',
      borderDownColor: '#f85149',
      wickUpColor: '#3fb950',
      wickDownColor: '#f85149',
    });

    const volSeries = chart.addSeries(HistogramSeries, {
      color: '#58a6ff',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volSeriesRef.current = volSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  const loadChart = useCallback(async () => {
  if (!candleSeriesRef.current || !volSeriesRef.current) return;
  
  setLoadingChart(true);
  setError('');

  try {
    const res = await stockApi.candles(symbol, interval.value, interval.size);
    const data = res.data;

    // 1. Twelve Data specific error check (even with 200 OK)
    if (!Array.isArray(data) || data.length === 0) {
      setError(data.message || 'No data found for this symbol.');
      return;
    }

    // 2. Map and Parse (Convert Strings to Numbers & Timestamps)
    // We reverse() because Lightweight Charts needs oldest -> newest
    const bars: CandlestickBar[] = [...data].reverse();

    const candles = bars.map(b => {
      // Use Unix timestamp (seconds) to avoid duplicate "Date" errors on intraday charts
      const timestamp = Math.floor(new Date(b.datetime).getTime() / 1000);
      
      return {
        time: timestamp as any,
        open: parseFloat(b.open),
        high: parseFloat(b.high),
        low: parseFloat(b.low),
        close: parseFloat(b.close),
      };
    });

    const volumes = bars.map(b => {
      const timestamp = Math.floor(new Date(b.datetime).getTime() / 1000);
      const isUp = parseFloat(b.close) >= parseFloat(b.open);
      
      return {
        time: timestamp as any,
        value: parseFloat(b.volume),
        color: isUp ? 'rgba(63,185,80,0.5)' : 'rgba(248,81,73,0.5)',
      };
    });

    // 3. Final validation before setting data
    if (candles.length > 0) {
      candleSeriesRef.current.setData(candles);
      volSeriesRef.current.setData(volumes);
      chartRef.current?.timeScale().fitContent();
    } else {
      setError('Market might be closed or data is unavailable.');
    }

  } catch (err: any) {
    console.error("Detailed Chart Error:", err);
    setError('Failed to fetch data. Check connection or API limit.');
  } finally {
    setLoadingChart(false);
  }
}, [symbol, interval]);

  const loadQuote = useCallback(async () => {
    setLoadingQuote(true);
    try {
      const res = await stockApi.quote(symbol);
      if (res.data.code && res.data.code !== 200) {
        setQuote(null);
      } else {
        setQuote(res.data);
      }
    } catch {
      setQuote(null);
    } finally {
      setLoadingQuote(false);
    }
  }, [symbol]);

  useEffect(() => {
    loadChart();
    loadQuote();
  }, [loadChart, loadQuote]);

  useEffect(() => {
    if (!query.trim()) { setSearchResults([]); setShowDropdown(false); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await stockApi.search(query);
        const hits: StockSearchResult[] = Array.isArray(res.data) ? res.data : [];
        setSearchResults(hits.slice(0, 8));
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const selectSymbol = (s: string) => {
    setSymbol(s.toUpperCase());
    setQuery('');
    setShowDropdown(false);
  };

  const isPositive = quote
    ? parseFloat(quote.percent_change) >= 0
    : null;

  const fmt = (v: string, dec = 2) =>
    parseFloat(v).toLocaleString('en-US', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    });

  return (
    <div className="stock-page">
      <div className="stock-header">
        <div className="page-header">
          <div className="page-header-icon"><TrendingUp size={20} /></div>
          <div>
            <h1 className="page-title">Stock Viewer</h1>
            <p className="page-subtitle">Candlestick charts · Real-time quotes</p>
          </div>
        </div>

        {/* Search */}
        <div className="search-wrap">
          <div className="search-box">
            {searching
              ? <div className="spinner small" />
              : <Search size={15} className="search-icon" />
            }
            <input
              className="search-input"
              type="text"
              placeholder="Search symbol or company…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => query && setShowDropdown(true)}
            />
            {query && (
              <button className="search-clear" onClick={() => { setQuery(''); setShowDropdown(false); }}>
                <X size={13} />
              </button>
            )}
          </div>
          {showDropdown && searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map(r => (
                <button
                  key={`${r.symbol}-${r.exchange}`}
                  className="dropdown-item"
                  onClick={() => selectSymbol(r.symbol)}
                >
                  <span className="dropdown-symbol">{r.symbol}</span>
                  <span className="dropdown-name">{r.instrument_name}</span>
                  <span className="dropdown-exchange">{r.exchange}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick picks */}
      <div className="symbol-pills">
        {DEFAULTS.map(s => (
          <button
            key={s}
            className={`symbol-pill ${symbol === s ? 'active' : ''}`}
            onClick={() => selectSymbol(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="error-banner"><Info size={15} />{error}</div>
      )}

      {/* Quote panel */}
      {!loadingQuote && quote && (
        <div className="quote-panel">
          <div className="quote-left">
            <div className="quote-symbol">{quote.symbol}</div>
            <div className="quote-name">{quote.name}</div>
            <div className="quote-exchange">
              <span>{quote.exchange}</span>
              <span className={`market-status ${quote.is_market_open ? 'open' : 'closed'}`}>
                ● {quote.is_market_open ? 'Market Open' : 'Market Closed'}
              </span>
            </div>
          </div>
          <div className="quote-right">
            <div className="quote-price">
              {quote.currency} {fmt(quote.close)}
            </div>
            <div className={`quote-change ${isPositive ? 'pos' : 'neg'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{isPositive ? '+' : ''}{fmt(quote.change)} ({fmt(quote.percent_change)}%)</span>
            </div>
          </div>
          <div className="quote-stats">
            {[
              { label: 'Open', value: fmt(quote.open) },
              { label: 'High', value: fmt(quote.high) },
              { label: 'Low', value: fmt(quote.low) },
              { label: 'Prev Close', value: fmt(quote.previous_close) },
              { label: '52W Low', value: fmt(quote.fifty_two_week.low) },
              { label: '52W High', value: fmt(quote.fifty_two_week.high) },
            ].map(({ label, value }) => (
              <div key={label} className="stat-item">
                <span className="stat-label">{label}</span>
                <span className="stat-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="chart-card">
        <div className="chart-toolbar">
          <div className="chart-symbol-tag">
            <Clock size={13} />
            <span>{symbol}</span>
          </div>
          <div className="interval-group">
            {INTERVALS.map(iv => (
              <button
                key={iv.value}
                className={`interval-btn ${interval.value === iv.value ? 'active' : ''}`}
                onClick={() => setInterval(iv)}
              >
                {iv.label}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-container-wrap">
          {loadingChart && (
            <div className="chart-overlay">
              <div className="spinner large" />
              <span>Loading chart…</span>
            </div>
          )}
          <div ref={chartContainerRef} className="chart-container" />
        </div>
        <div className="chart-legend">
          <span className="legend-up">▲ Bullish</span>
          <span className="legend-down">▼ Bearish</span>
          <span className="legend-vol">■ Volume</span>
        </div>
      </div>
    </div>
  );
};

export default StockViewer;
