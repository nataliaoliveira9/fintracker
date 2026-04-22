import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, RefreshCw, BarChart2 } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <BarChart2 size={22} className="brand-icon" />
        <span className="brand-name">Bolota<span className="brand-accent">Dev</span></span>
      </Link>
      <div className="navbar-links">
        <Link
          to="/currency"
          className={`nav-link ${location.pathname === '/currency' ? 'active' : ''}`}
        >
          <RefreshCw size={16} />
          <span>Currency</span>
        </Link>
        <Link
          to="/stocks"
          className={`nav-link ${location.pathname === '/stocks' ? 'active' : ''}`}
        >
          <TrendingUp size={16} />
          <span>Stocks</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
