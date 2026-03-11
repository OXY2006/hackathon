import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
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
      <div className="flex flex-col min-h-screen bg-dark-950 text-dark-50">
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <LandingPage />
                </>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Dashboard />
                </>
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <UploadPage />
                </>
              </ProtectedRoute>
            } />
            <Route path="/prediction" element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <PredictionPage />
                </>
              </ProtectedRoute>
            } />
            <Route path="/performance" element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <ModelPerformance />
                </>
              </ProtectedRoute>
            } />
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
