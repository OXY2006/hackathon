import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import PredictionPage from './pages/PredictionPage';
import ModelPerformance from './pages/ModelPerformance';
import LoginPage from './pages/LoginPage';
import ImpactCalculator from './pages/ImpactCalculator';
import SystemHealth from './components/SystemHealth';
import { DarkModeProvider, NotificationProvider } from './contexts';

// Simple authentication wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <DarkModeProvider>
      <NotificationProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors duration-300">
            <SystemHealth />
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
              <Route path="/calculator" element={
                <ProtectedRoute>
                  <Sidebar />
                  <main className="flex-grow">
                    <ImpactCalculator />
                  </main>
                </ProtectedRoute>
              } />
            </Routes>

            <footer className="py-8 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-t border-slate-100 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 mt-auto transition-colors duration-300">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-energy-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">© {new Date().getFullYear()} AI-Driven Energy Theft Detection System</p>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Ensuring energy security through advanced machine learning.</p>
              </div>
            </footer>
          </div>
        </Router>
      </NotificationProvider>
    </DarkModeProvider>
  );
}

export default App;
