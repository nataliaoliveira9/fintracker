import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CurrencyConverter from './pages/CurrencyConverter';
import StockViewer from './pages/StockViewer';
import './index.css';
import './App.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/currency" element={<CurrencyConverter />} />
            <Route path="/stocks" element={<StockViewer />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <span>Built with Django + React · </span>
          <span className="footer-accent">BolotaDev Portfolio</span>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
