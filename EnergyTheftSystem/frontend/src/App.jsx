import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import PredictionPage from './pages/PredictionPage';
import ModelPerformance from './pages/ModelPerformance';
import LoginPage from './pages/LoginPage';

// Simple authentication wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes - Sidebar is shared across all */}
          <Route path="/" element={
            <ProtectedRoute>
              <Sidebar />
              <main className="flex-grow">
                <LandingPage />
              </main>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Sidebar />
              <main className="flex-grow">
                <Dashboard />
              </main>
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <Sidebar />
              <main className="flex-grow">
                <UploadPage />
              </main>
            </ProtectedRoute>
          } />
          <Route path="/prediction" element={
            <ProtectedRoute>
              <Sidebar />
              <main className="flex-grow">
                <PredictionPage />
              </main>
            </ProtectedRoute>
          } />
          <Route path="/performance" element={
            <ProtectedRoute>
              <Sidebar />
              <main className="flex-grow">
                <ModelPerformance />
              </main>
            </ProtectedRoute>
          } />
        </Routes>

        <footer className="py-8 bg-white border-t border-slate-200 text-center text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-sm font-medium">© {new Date().getFullYear()} AI-Driven Energy Theft Detection System</p>
            <p className="text-xs mt-1 text-slate-400">Ensuring energy security through advanced machine learning.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
