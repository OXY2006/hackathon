import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import PredictionPage from './pages/PredictionPage';
import ModelPerformance from './pages/ModelPerformance';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-dark-950 text-dark-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/prediction" element={<PredictionPage />} />
            <Route path="/performance" element={<ModelPerformance />} />
          </Routes>
        </main>
        
        <footer className="py-6 border-t border-dark-800 text-center text-dark-400 mt-auto">
          <p>© {new Date().getFullYear()} AI-Driven Energy Theft Detection System. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
