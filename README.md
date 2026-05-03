# FinTracker

A personal finance dashboard with real-time stock market data and currency conversion. Built with a Django REST API backend and a React (TypeScript) frontend, containerized with Docker and served via Nginx.

---

## Features

- 📈 **Stock Viewer** — Search any ticker symbol and view interactive OHLCV candlestick charts powered by TradingView Lightweight Charts and the Twelve Data API
- 💱 **Currency Converter** — Real-time currency conversion and exchange rates for 100+ currencies via the Fixer.io (apilayer) API
- ⚡ **API Caching** — Database-backed response caching minimizes external API quota usage
- 🛡️ **Rate Limiting** — DRF throttling (60 req/min per anonymous user) protects against runaway traffic
- 🐳 **Fully Dockerized** — One command spins up the full stack (backend, frontend, Nginx reverse proxy)

---

## Tech Stack

| Layer     | Technology                                              |
|-----------|---------------------------------------------------------|
| Backend   | Python 3.12, Django 6, Django REST Framework, Gunicorn  |
| Frontend  | React 19, TypeScript, Vite, React Router, Axios         |
| Charts    | TradingView Lightweight Charts                          |
| Data      | Twelve Data API (stocks), Fixer.io / apilayer (currency)|
| Infra     | Docker, Docker Compose, Nginx, SQLite                   |

---

## Project Structure

```
DjangoFinance/
├── backend/
│   ├── fintracker/         # Django project (settings, URLs, WSGI)
│   ├── stocks/             # Stock market app (search, quotes, candlesticks)
│   ├── currency/           # Currency conversion app (list, convert, rates)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/          # Home, StockViewer, CurrencyConverter
│   │   ├── components/     # Navbar and shared UI
│   │   ├── services/       # Axios API clients
│   │   └── hooks/          # Custom React hooks
│   └── Dockerfile
├── nginx/                  # Nginx reverse proxy config
├── docker-compose.yml
└── .env                    # Secret keys (never commit!)
```

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- API keys for [Twelve Data](https://twelvedata.com/) and [Fixer.io via apilayer](https://apilayer.com/marketplace/fixer-api)

### 1. Clone and configure environment

```bash
git clone <your-repo-url>
cd DjangoFinance
cp .env.example .env   # then fill in your values
```

Edit `.env`:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
APPDATA_API_KEY=your_fixer_apilayer_key
TWELVEDATA_API_KEY=your_twelvedata_key
CORS_ALLOWED_ORIGINS=http://localhost
```

### 2. Run with Docker

```bash
docker compose up --build
```

The app will be available at **http://localhost**.

### 3. Initialize the cache table (first run only)

```bash
docker compose exec backend python manage.py createcachetable
```

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

python manage.py migrate
python manage.py createcachetable
python manage.py runserver
```

Backend runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`. Vite proxies API calls to the Django backend automatically.

---

## API Reference

All endpoints are prefixed with `/api/`.

### Stocks (`/api/stocks/`)

| Endpoint               | Method | Params                                      | Description                        |
|------------------------|--------|---------------------------------------------|------------------------------------|
| `stocks/search/`       | GET    | `q` (string, required)                      | Search for ticker symbols          |
| `stocks/quote/`        | GET    | `symbol` (string, required)                 | Get current quote for a symbol     |
| `stocks/candles/`      | GET    | `symbol`, `interval` (default `1day`), `outputsize` (default `90`) | OHLCV candlestick data |

### Currency (`/api/currency/`)

| Endpoint               | Method | Params                                         | Description                      |
|------------------------|--------|------------------------------------------------|----------------------------------|
| `currency/list/`       | GET    | —                                              | List all supported currencies    |
| `currency/rates/`      | GET    | `base` (default `USD`)                         | Latest exchange rates for a base |
| `currency/convert/`    | GET    | `from`, `to`, `amount` (all default to USD/BRL/1) | Convert between currencies    |

> **Rate limiting:** 60 requests/minute per anonymous client. Currency symbols and rates are cached (24h and 1h respectively).

---

## Environment Variables

| Variable                | Description                                     | Required |
|-------------------------|-------------------------------------------------|----------|
| `DJANGO_SECRET_KEY`     | Django secret key                               | ✅       |
| `DEBUG`                 | Enable debug mode (`True`/`False`)              | ✅       |
| `ALLOWED_HOSTS`         | Comma-separated list of allowed hostnames       | ✅       |
| `APPDATA_API_KEY`       | Fixer.io API key (via apilayer.com)             | ✅       |
| `TWELVEDATA_API_KEY`    | Twelve Data API key                             | ✅       |
| `CORS_ALLOWED_ORIGINS`  | Comma-separated list of allowed CORS origins    | ✅       |

---

## License

This project is for personal use and portfolio purposes.  
Built by [Natalia Oliveira](https://github.com/nataliaoliveira9).
