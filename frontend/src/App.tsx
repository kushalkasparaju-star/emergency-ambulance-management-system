import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useSocket } from './hooks/useSocket';
import { useState, useEffect } from 'react';
import { Activity, Map, CheckCircle2, Route as RouteIcon, Bell, Sun, Moon, LogOut } from 'lucide-react';

import Login from './pages/Login';
import GpsTracking from './pages/GpsTracking';
import SignalPriority from './pages/SignalPriority';
import RouteOptimization from './pages/RouteOptimization';
import AlertFeed from './pages/AlertFeed';
import SystemLogs from './pages/SystemLogs';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [alertsCount, setAlertsCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!socket) return;
    const handleAlert = () => setAlertsCount(c => c + 1);
    socket.on('alert:new', handleAlert);
    return () => { socket.off('alert:new', handleAlert); };
  }, [socket]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background/95 px-4 md:px-6 backdrop-blur">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Activity className="h-6 w-6" />
          EMS Dashboard
        </div>
        <nav className="hidden md:flex ml-10 space-x-6 text-sm font-medium items-center">
          <Link to="/" className="flex items-center gap-2 hover:text-primary transition-colors"><Map size={16}/> GPS</Link>
          <Link to="/signals" className="flex items-center gap-2 hover:text-primary transition-colors"><CheckCircle2 size={16}/> Signals</Link>
          <Link to="/routes" className="flex items-center gap-2 hover:text-primary transition-colors"><RouteIcon size={16}/> Routing</Link>
          <Link to="/alerts" className="flex items-center gap-2 hover:text-primary transition-colors relative" onClick={() => setAlertsCount(0)}>
            <Bell size={16}/> Alerts
            {alertsCount > 0 && <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">{alertsCount}</span>}
          </Link>
          <Link to="/logs" className="flex items-center gap-2 hover:text-primary transition-colors">Logs</Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-muted transition-colors">
            {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
          <div className="text-sm font-medium mr-4 hidden lg:block">{user?.email}</div>
          <button onClick={logout} className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
            <LogOut size={16} /><span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>
      <main className="flex-1 flex flex-col p-4 md:p-6 pb-8 h-full w-full mx-auto">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<GpsTracking />} />
                  <Route path="/signals" element={<SignalPriority />} />
                  <Route path="/routes" element={<RouteOptimization />} />
                  <Route path="/alerts" element={<AlertFeed />} />
                  <Route path="/logs" element={<SystemLogs />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
