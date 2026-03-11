import { Link, useLocation } from 'react-router-dom';
import { Zap, LayoutDashboard, UploadCloud, BarChart3, Activity } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  
  const navLinks = [
    { name: 'Home', path: '/', icon: Zap },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload', path: '/upload', icon: UploadCloud },
    { name: 'Performance', path: '/performance', icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-energy-600/20 rounded-lg group-hover:bg-energy-600/30 transition-colors">
                <Activity className="h-6 w-6 text-energy-500" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Energy<span className="text-energy-500">Shield</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-dark-800 text-energy-500' 
                      : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-energy-500' : ''}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Mobile menu button could go here */}
          <div className="md:hidden flex items-center">
             <div className="p-2 text-dark-300">Menu</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
