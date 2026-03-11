import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, LayoutDashboard, UploadCloud, BarChart3, Activity, LogOut, Home, Menu, X, ChevronRight, Calculator, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../contexts';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { dark, toggle } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('#sidebar-toggle')) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload', path: '/upload', icon: UploadCloud },
    { name: 'Prediction', path: '/prediction', icon: Activity },
    { name: 'Calculator', path: '/calculator', icon: Calculator },
    { name: 'Performance', path: '/performance', icon: BarChart3 },
  ];

  return (
    <>
      {/* Hamburger Toggle Button */}
      <button
        id="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[60] p-3 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <div className="relative w-5 h-5">
          <Menu
            className={`absolute inset-0 h-5 w-5 text-slate-700 dark:text-slate-200 transition-all duration-300 ${isOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
              }`}
          />
          <X
            className={`absolute inset-0 h-5 w-5 text-slate-700 dark:text-slate-200 transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
              }`}
          />
        </div>
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/25 backdrop-blur-[3px] z-[50] transition-opacity duration-400 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Panel */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-72 z-[55] transform transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-r border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-slate-900/10 flex flex-col relative overflow-hidden transition-colors duration-300">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-energy-100/30 dark:from-energy-900/20 to-transparent rounded-bl-full pointer-events-none"></div>

          {/* Brand Header */}
          <div className="px-6 pt-20 pb-6 border-b border-slate-100 dark:border-slate-800">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2.5 bg-gradient-to-br from-energy-500 to-emerald-600 rounded-xl shadow-lg shadow-energy-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white block leading-tight">
                  Energy-<span className="text-energy-600 dark:text-energy-400">Sentinel</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Theft Detection
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              <p className="px-4 pt-2 pb-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Navigation
              </p>
              {navLinks.map((link, i) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${isActive
                        ? 'bg-gradient-to-r from-energy-50 to-energy-100/50 dark:from-energy-900/20 dark:to-energy-800/10 text-energy-700 dark:text-energy-400 shadow-sm shadow-energy-500/5 border border-energy-100/50 dark:border-energy-800/30'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-lg transition-all duration-300 ${isActive
                          ? 'bg-gradient-to-br from-energy-500 to-emerald-600 shadow-md shadow-energy-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:scale-110'
                        }`}>
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'} transition-colors`} />
                      </div>
                      <span>{link.name}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-energy-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Logout Section */}
          {/* Logout & Settings Section */}
          <div className="px-3 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <button
              onClick={toggle}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:scale-110 transition-all duration-300">
                  {dark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-500" />}
                </div>
                <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all duration-300 group active:scale-95"
            >
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 group-hover:scale-110 transition-all duration-300">
                <LogOut className="h-4 w-4 text-slate-500 dark:text-slate-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300" />
              </div>
              <span>Logout</span>
            </button>

            {/* Version badge */}
            <div className="mt-4 px-4">
              <div className="flex items-center gap-2 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-energy-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></div>
                v2.0 — AI Engine Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
