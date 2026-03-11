import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, LayoutDashboard, UploadCloud, BarChart3, Activity, LogOut, Home, Menu, X, ChevronRight } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
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
    { name: 'Performance', path: '/performance', icon: BarChart3 },
    { name: 'Prediction', path: '/prediction', icon: Activity },
  ];

  return (
    <>
      {/* Hamburger Toggle Button - Fixed top left */}
      <button
        id="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[60] p-3 rounded-xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <div className="relative w-5 h-5">
          <Menu
            className={`absolute inset-0 h-5 w-5 text-slate-700 transition-all duration-300 ${
              isOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
            }`}
          />
          <X
            className={`absolute inset-0 h-5 w-5 text-slate-700 transition-all duration-300 ${
              isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
            }`}
          />
        </div>
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[50] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Panel */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-72 z-[55] transform transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full bg-white/95 backdrop-blur-2xl border-r border-slate-200/60 shadow-2xl shadow-slate-900/10 flex flex-col">
          {/* Brand Header */}
          <div className="px-6 pt-20 pb-6 border-b border-slate-100">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2.5 bg-gradient-to-br from-energy-500 to-green-600 rounded-xl shadow-lg shadow-energy-500/30 group-hover:scale-110 transition-transform duration-500">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tighter text-slate-900 block leading-tight">
                  Energy-<span className="text-energy-600">Sentinel</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Theft Detection
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              <p className="px-4 pt-2 pb-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                Navigation
              </p>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                      isActive
                        ? 'bg-gradient-to-r from-energy-50 to-energy-100/50 text-energy-700 shadow-sm shadow-energy-500/5'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-energy-500 shadow-md shadow-energy-500/30'
                          : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}>
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
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
          <div className="px-3 pb-6 pt-2 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50/50 transition-all duration-300 group"
            >
              <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-red-100 transition-all duration-300">
                <LogOut className="h-4 w-4 text-slate-500 group-hover:text-red-500 transition-colors duration-300" />
              </div>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
