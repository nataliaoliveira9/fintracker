import axios from 'axios';

const BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Currency
export const currencyApi = {
  list: () => api.get('/currency/list/'),
  convert: (from: string, to: string, amount: number) =>
    api.get('/currency/convert/', { params: { from, to, amount } }),
  rates: (base: string) =>
    api.get('/currency/rates/', { params: { base } }),
};

// Stocks
export const stockApi = {
  search: (q: string) => api.get('/stocks/search/', { params: { q } }),
  candles: (symbol: string, interval: string, outputsize: number) =>
    api.get('/stocks/candles/', { params: { symbol, interval, outputsize } }),
  quote: (symbol: string) => api.get('/stocks/quote/', { params: { symbol } }),
};

export default api;
