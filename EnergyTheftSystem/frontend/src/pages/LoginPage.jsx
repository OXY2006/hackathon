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
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* Left: Immersive Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden group">
        <img 
          src="/login_bg.png" 
          alt="Energy Conservation" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-energy-900/60 via-transparent to-energy-950/80 backdrop-blur-[2px]"></div>
        
        <div className="relative z-10 flex flex-col justify-between p-16 h-full text-white">
          <div className="flex items-center space-x-3 animate-reveal">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <span className="text-2xl font-black uppercase tracking-[0.2em]">EnergyShield</span>
          </div>

          <div className="space-y-6 max-w-lg mb-20 animate-reveal" style={{ animationDelay: '200ms' }}>
            <h1 className="text-6xl font-black leading-tight tracking-tighter">
              Guardians of <br />
              <span className="text-energy-400">Pure Energy.</span>
            </h1>
            <p className="text-xl text-white/80 font-medium leading-relaxed">
              Every watt saved is a step towards a sustainable future. Log in to monitor global energy health in real-time.
            </p>
          </div>

          <div className="flex items-center space-x-10 animate-reveal" style={{ animationDelay: '400ms' }}>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-energy-500 bg-slate-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" />
                </div>
              ))}
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-energy-300">
              Joined by 2k+ Engineers
            </p>
          </div>
        </div>
      </div>

      {/* Right: Login Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 relative bg-slate-50/30">
        {/* Animated Background Element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-energy-100/30 rounded-full blur-[120px] -mr-20 -mt-20 animate-pulse-slow"></div>
        
        <div className="w-full max-w-md relative z-10 animate-reveal" style={{ animationDelay: '600ms' }}>
          <div className="glass-card p-10 sm:p-12 border-white bg-white/80">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Welcome Back</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Enter your secure credentials</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Identity Profile</label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-energy-500/5 focus:border-energy-500/50 transition-all duration-500 shadow-sm"
                    placeholder="Username or Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <div className="absolute inset-0 rounded-2xl border border-energy-500/0 group-focus-within:border-energy-500/20 pointer-events-none transition-all duration-500"></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Access Protocol</label>
                <div className="relative group">
                  <input
                    type="password"
                    required
                    className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-energy-500/5 focus:border-energy-500/50 transition-all duration-500 shadow-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-0 rounded-2xl border border-energy-500/0 group-focus-within:border-energy-500/20 pointer-events-none transition-all duration-500"></div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-5 text-base flex items-center justify-center space-x-3 overflow-hidden"
              >
                {isLoading ? (
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <span>Initialize Access</span>
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-50 text-center">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Protected by <span className="text-energy-600">Quantum Encryption</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
