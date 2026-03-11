import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate a brief delay for realism
    setTimeout(() => {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({ name: username || 'User' }));
      setIsLoading(false);
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
      {/* Background blobs for premium look */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-energy-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-energy-900/20 rounded-full blur-[100px] animate-pulse-slow"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-dark-900/50 backdrop-blur-xl border border-dark-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-block p-3 bg-energy-500/10 rounded-2xl mb-4 border border-energy-500/20">
              <svg className="w-8 h-8 text-energy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-dark-50">Welcome Back</h2>
            <p className="text-dark-400 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Username</label>
              <input
                type="text"
                required
                className="w-full bg-dark-950/50 border border-dark-800 rounded-xl px-4 py-3 text-dark-50 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-energy-500/50 focus:border-energy-500 transition-all"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full bg-dark-950/50 border border-dark-800 rounded-xl px-4 py-3 text-dark-50 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-energy-500/50 focus:border-energy-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-energy-500 hover:bg-energy-600 text-dark-950 font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-dark-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Login'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-dark-500">
            <p>Don't have an account? <span className="text-energy-400 cursor-pointer hover:underline">Contact Administrator</span></p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-dark-600 text-xs">
          AI-Driven Energy Theft Detection System Secure Access
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
