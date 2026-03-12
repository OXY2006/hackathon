import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';

export default function SystemHealth() {
  const [status, setStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [lastCheck, setLastCheck] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/model-info`, { signal: AbortSignal.timeout(4000) });
        setStatus(res.ok ? 'online' : 'offline');
      } catch {
        setStatus('offline');
      }
      setLastCheck(new Date());
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const colors = {
    online: 'bg-energy-500',
    offline: 'bg-red-500',
    checking: 'bg-amber-500 animate-pulse'
  };

  return (
    <div className="fixed bottom-4 right-4 z-[70]">
      {expanded && (
        <div className="mb-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 w-64 animate-reveal">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">System Status</h4>
            <button onClick={() => setExpanded(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Backend API</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${
                status === 'online' ? 'bg-energy-50 text-energy-700 dark:bg-energy-900/30 dark:text-energy-400' :
                status === 'offline' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${colors[status]}`} />
                {status === 'online' ? 'Connected' : status === 'offline' ? 'Disconnected' : 'Checking...'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">ML Engine</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${
                status === 'online' ? 'bg-energy-50 text-energy-700 dark:bg-energy-900/30 dark:text-energy-400' :
                'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-energy-500' : 'bg-red-500'}`} />
                {status === 'online' ? 'Active' : 'Inactive'}
              </span>
            </div>
            {lastCheck && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-center pt-2 border-t border-slate-100 dark:border-slate-700">
                Last checked: {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`group p-3 rounded-full shadow-lg border transition-all duration-300 hover:scale-110 active:scale-95 ${
          status === 'online'
            ? 'bg-white dark:bg-slate-800 border-energy-200 dark:border-energy-800 shadow-energy-500/10'
            : status === 'offline'
            ? 'bg-white dark:bg-slate-800 border-red-200 dark:border-red-800 shadow-red-500/10'
            : 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800'
        }`}
        title="System health"
      >
        <div className="relative">
          {status === 'online' ? (
            <Wifi className="h-4 w-4 text-energy-600 dark:text-energy-400" />
          ) : status === 'offline' ? (
            <WifiOff className="h-4 w-4 text-red-500" />
          ) : (
            <Activity className="h-4 w-4 text-amber-500 animate-pulse" />
          )}
          <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${colors[status]}`} />
        </div>
      </button>
    </div>
  );
}
