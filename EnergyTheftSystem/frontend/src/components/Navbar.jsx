import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, LayoutDashboard, UploadCloud, BarChart3, Activity, LogOut } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
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
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_1px_20px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group relative">
              <div className="p-2.5 bg-gradient-to-br from-energy-500 to-green-600 rounded-xl shadow-lg shadow-energy-500/30 group-hover:scale-110 transition-transform duration-500">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-slate-900">
                Energy<span className="text-energy-600">Shield</span>
              </span>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-energy-500 rounded-full animate-ping"></div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center space-x-1 p-1 bg-slate-50/50 rounded-2xl border border-slate-100">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                      isActive 
                        ? 'bg-white text-energy-600 shadow-md shadow-energy-500/5' 
                        : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-energy-600' : ''} transition-transform group-hover:scale-110`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="h-8 w-[1px] bg-slate-100 mx-4"></div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
              <span>Exit</span>
            </button>
          </div>
          
          {/* Mobile menu button could go here */}
          <div className="md:hidden flex items-center">
             <div className="p-2 text-slate-500">Menu</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
