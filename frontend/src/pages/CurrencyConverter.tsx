import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeftRight, RefreshCw, TrendingUp, Info } from 'lucide-react';
import { currencyApi } from '../services/api';
import './CurrencyConverter.css';

interface CurrencyOption {
  code: string;
  name: string;
}

const POPULAR = ['USD', 'EUR', 'BRL', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'ARS'];

const CurrencyConverter: React.FC = () => {
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('BRL');
  const [amount, setAmount] = useState('1');
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLoading(true);
    currencyApi.list()
      .then(res => {
        const data = res.data;
        if (data.currencies) {
          const list: CurrencyOption[] = Object.entries(data.currencies).map(
            ([code, name]) => ({ code, name: name as string })
          );
          list.sort((a, b) => {
            const ai = POPULAR.indexOf(a.code);
            const bi = POPULAR.indexOf(b.code);
            if (ai !== -1 && bi !== -1) return ai - bi;
            if (ai !== -1) return -1;
            if (bi !== -1) return 1;
            return a.code.localeCompare(b.code);
          });
          setCurrencies(list);
        }
      })
      .catch(() => setError('Failed to load currencies. Check your API key.'))
      .finally(() => setLoading(false));
  }, []);

  const convert = useCallback(async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    setConverting(true);
    setError('');
    try {
      const res = await currencyApi.convert(from, to, num);
      const data = res.data;
      if (data.result !== undefined) {
        setResult(data.result);
        setRate(data.info?.rate ?? null);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch {
      setError('Conversion failed. Please try again.');
    } finally {
      setConverting(false);
    }
  }, [from, to, amount]);

  useEffect(() => {
    const t = setTimeout(() => { convert(); }, 600);
    return () => clearTimeout(t);
  }, [convert]);

  const swap = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
  };

  const formatted = (val: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(val);

  return (
    <div className="converter-page">
      <div className="page-header">
        <div className="page-header-icon"><RefreshCw size={20} /></div>
        <div>
          <h1 className="page-title">Currency Converter</h1>
          <p className="page-subtitle">Live exchange rates · 170+ currencies</p>
        </div>
      </div>

      {error && <div className="error-banner"><Info size={15} />{error}</div>}

      <div className="converter-card">
        <div className="converter-row">
          {/* Amount + From */}
          <div className="input-group">
            <label className="input-label">Amount</label>
            <div className="amount-row">
              <input
                type="number"
                className="amount-input"
                value={amount}
                min="0"
                onChange={e => { setAmount(e.target.value); setResult(null); }}
                placeholder="1.00"
              />
              <select
                className="currency-select"
                value={from}
                onChange={e => { setFrom(e.target.value); setResult(null); }}
                disabled={loading}
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap button */}
          <button className="swap-btn" onClick={swap} title="Swap currencies">
            <ArrowLeftRight size={18} />
          </button>

          {/* To */}
          <div className="input-group">
            <label className="input-label">Convert to</label>
            <select
              className="currency-select full-width"
              value={to}
              onChange={e => { setTo(e.target.value); setResult(null); }}
              disabled={loading}
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        <div className="result-panel">
          {converting ? (
            <div className="result-loading">
              <div className="spinner" />
              <span>Fetching rate…</span>
            </div>
          ) : result !== null ? (
            <>
              <div className="result-main">
                <span className="result-from">{formatted(parseFloat(amount) || 1)} {from}</span>
                <span className="result-equals">=</span>
                <span className="result-value">{formatted(result)}</span>
                <span className="result-to-label">{to}</span>
              </div>
              {rate !== null && (
                <div className="result-meta">
                  <TrendingUp size={13} />
                  <span>1 {from} = {formatted(rate)} {to}</span>
                  {lastUpdated && <span className="rate-time">· {lastUpdated}</span>}
                </div>
              )}
            </>
          ) : (
            <div className="result-placeholder">Enter an amount to see the conversion</div>
          )}
        </div>
      </div>

      {/* Popular quick-picks */}
      <div className="quick-section">
        <h3 className="quick-title">Quick compare — {from} rates</h3>
        <div className="quick-grid">
          {POPULAR.filter(c => c !== from).slice(0, 8).map(code => (
            <button
              key={code}
              className={`quick-btn ${to === code ? 'active' : ''}`}
              onClick={() => { setTo(code); setResult(null); }}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
