import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, Shield } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
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
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-energy-900/40 to-slate-950/80"></div>
        
        {/* Animated floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="particle absolute w-1.5 h-1.5 bg-energy-400/40 rounded-full"
              style={{
                left: `${15 + i * 18}%`,
                top: `${20 + i * 12}%`,
                animationDelay: `${i * 1.5}s`,
                animationDuration: `${6 + i * 2}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-16 h-full text-white">
          <div className="flex items-center space-x-3 animate-reveal">
            <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 shadow-lg shadow-black/10">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <span className="text-xl font-black uppercase tracking-[0.2em]">Energy-Sentinel</span>
          </div>

          <div className="space-y-6 max-w-lg mb-20">
            <h1 className="text-6xl font-black leading-tight tracking-tighter animate-reveal" style={{ animationDelay: '200ms' }}>
              Guardians of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-energy-400 to-emerald-300">Pure Energy.</span>
            </h1>
            <p className="text-xl text-white/70 font-medium leading-relaxed animate-reveal" style={{ animationDelay: '400ms' }}>
              Every watt saved is a step towards a sustainable future. Log in to monitor global energy health in real-time.
            </p>
          </div>

          <div className="flex items-center space-x-10 animate-reveal" style={{ animationDelay: '600ms' }}>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-energy-500/70 bg-slate-200 overflow-hidden shadow-lg shadow-black/20 hover:scale-110 hover:z-10 transition-all duration-300">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" />
                </div>
              ))}
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-energy-300/80">
              Joined by 2k+ Engineers
            </p>
          </div>
        </div>
      </div>

      {/* Right: Login Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 relative bg-gradient-to-br from-slate-50/50 via-white to-energy-50/20">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-energy-100/20 rounded-full blur-[120px] -mr-20 -mt-20 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-100/15 rounded-full blur-[100px] -ml-10 -mb-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        <div className="w-full max-w-md relative z-10 animate-reveal" style={{ animationDelay: '300ms' }}>
          <div className="bg-white/90 backdrop-blur-xl p-10 sm:p-12 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            {/* Logo mark */}
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-gradient-to-br from-energy-500 to-emerald-600 rounded-2xl shadow-xl shadow-energy-500/20">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Enter your secure credentials</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center">
                  <User className="h-3 w-3 mr-1.5" />
                  Identity Profile
                </label>
                <div className={`relative rounded-2xl transition-all duration-500 ${focusedField === 'username' ? 'shadow-lg shadow-energy-500/10' : ''}`}>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-energy-500/20 focus:border-energy-400 focus:bg-white transition-all duration-500 text-[15px] font-medium"
                    placeholder="Username or Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center">
                  <Lock className="h-3 w-3 mr-1.5" />
                  Access Protocol
                </label>
                <div className={`relative rounded-2xl transition-all duration-500 ${focusedField === 'password' ? 'shadow-lg shadow-energy-500/10' : ''}`}>
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-energy-500/20 focus:border-energy-400 focus:bg-white transition-all duration-500 text-[15px] font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group btn-primary w-full py-4 text-sm flex items-center justify-center space-x-3 overflow-hidden hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-energy-500/30 transition-all duration-300"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <span>Initialize Access</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center">
                <Lock className="h-3 w-3 mr-1.5 text-energy-500" />
                Protected by <span className="text-energy-600 ml-1">Quantum Encryption</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
