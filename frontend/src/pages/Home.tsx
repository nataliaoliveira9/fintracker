import { Link } from 'react-router-dom';
import { RefreshCw, TrendingUp, ArrowRight, Activity } from 'lucide-react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <div className="hero">
        <div className="hero-badge">
          <Activity size={13} />
          <span>Portfolio Project</span>
        </div>
        <h1 className="hero-title">
          Financial<br />
          <span className="hero-title-accent">Tools Suite</span>
        </h1>
        <p className="hero-subtitle">
          Real-time currency conversion and stock market analytics,<br />
          powered by live market data APIs.
        </p>
      </div>

      <div className="cards-grid">
        <Link to="/currency" className="app-card">
          <div className="card-icon-wrap">
            <RefreshCw size={28} className="card-icon" />
          </div>
          <h2 className="card-title">Currency Converter</h2>
          <p className="card-desc">
            Convert between 170+ world currencies using live exchange rates.
            Compare rates and track currency performance.
          </p>
          <div className="card-tags">
            <span className="tag">Live Rates</span>
            <span className="tag">170+ Currencies</span>
          </div>
          <div className="card-cta">
            <span>Open Converter</span>
            <ArrowRight size={16} />
          </div>
        </Link>

        <Link to="/stocks" className="app-card">
          <div className="card-icon-wrap">
            <TrendingUp size={28} className="card-icon" />
          </div>
          <h2 className="card-title">Stock Viewer</h2>
          <p className="card-desc">
            Explore candlestick charts for any stock or ETF, with multiple
            timeframes and real-time quote data.
          </p>
          <div className="card-tags">
            <span className="tag">Candlestick Charts</span>
            <span className="tag">Real-time Quotes</span>
          </div>
          <div className="card-cta">
            <span>Open Charts</span>
            <ArrowRight size={16} />
          </div>
        </Link>
      </div>

      <div className="tech-stack">
        <span className="tech-label">Built with</span>
        <div className="tech-pills">
          {['Django', 'REST Framework', 'React', 'TypeScript', 'Lightweight Charts'].map(t => (
            <span key={t} className="tech-pill">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
