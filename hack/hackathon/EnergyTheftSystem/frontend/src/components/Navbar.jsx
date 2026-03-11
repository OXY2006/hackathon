import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, LayoutDashboard, UploadCloud, BarChart3, Activity, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Zap },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload', path: '/upload', icon: UploadCloud },
    { name: 'Performance', path: '/performance', icon: BarChart3 },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_1px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Left side - Logo and Dropdown Menu */}
            <div className="flex items-center">
              {/* Dropdown Menu */}
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 mr-4 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {isMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                  <span className="font-semibold text-sm">Menu</span>
                </button>
                
                {/* Dropdown Content */}
                {isMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = location.pathname === link.path;
                      
                      return (
                        <Link
                          key={link.name}
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            isActive 
                              ? 'bg-gradient-to-r from-energy-500 to-green-600 text-white' 
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{link.name}</span>
                        </Link>
                      );
                    })}
                    
                    <div className="h-px bg-slate-200 my-2"></div>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-200 w-full"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
              
              <Link to="/" className="flex items-center space-x-3 group relative">
                <div className="p-2.5 bg-gradient-to-br from-energy-500 to-green-600 rounded-xl shadow-lg shadow-energy-500/30 group-hover:scale-110 transition-transform duration-500">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <span className="font-black text-2xl tracking-tighter text-slate-900">
                  Energy-<span className="text-energy-600">Sentinel</span>
                </span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-energy-500 rounded-full animate-ping"></div>
              </Link>
            </div>

            {/* Right side - Empty for now, can add user info later */}
            <div className="flex items-center">
              {/* User avatar or other elements can go here */}
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop to close menu when clicking outside */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  );
}

