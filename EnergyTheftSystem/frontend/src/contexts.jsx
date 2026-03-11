import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Dark Mode Context ───
const DarkModeContext = createContext();
export const useDarkMode = () => useContext(DarkModeContext);

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('darkMode', dark);
  }, [dark]);

  return (
    <DarkModeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </DarkModeContext.Provider>
  );
}

// ─── Notification Context ───
const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const entry = { id, timestamp: new Date(), read: false, ...notification };
    setNotifications(prev => [entry, ...prev].slice(0, 50)); // cap at 50
    // Auto-dismiss toast after 5s
    setTimeout(() => dismissToast(id), 5000);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, dismissed: true } : n));
  }, []);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, dismissToast, markRead, markAllRead, unreadCount }}>
      {children}
      {/* Toast overlay */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {notifications.filter(n => !n.dismissed).slice(0, 3).map((n) => (
          <div
            key={n.id}
            className="pointer-events-auto animate-reveal max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-slate-900/10 p-4 flex items-start gap-3"
          >
            <div className={`shrink-0 w-2 h-2 mt-2 rounded-full ${
              n.level === 'critical' ? 'bg-red-500' : n.level === 'warning' ? 'bg-amber-500' : 'bg-energy-500'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{n.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
            </div>
            <button
              onClick={() => dismissToast(n.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg leading-none"
            >×</button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

// ─── Analysis History helpers ───
export function saveAnalysis(filename, summary) {
  const history = getAnalysisHistory();
  history.unshift({
    id: Date.now(),
    filename,
    timestamp: new Date().toISOString(),
    ...summary
  });
  sessionStorage.setItem('analysisHistory', JSON.stringify(history.slice(0, 20)));
}

export function getAnalysisHistory() {
  try {
    return JSON.parse(sessionStorage.getItem('analysisHistory') || '[]');
  } catch { return []; }
}
