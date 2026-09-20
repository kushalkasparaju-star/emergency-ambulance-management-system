import { useState, useEffect } from 'react';
import { api } from '../api';
import { useSocket } from '../hooks/useSocket';
import { format } from 'date-fns';
import { AlertTriangle, Info, BellRing } from 'lucide-react';

export default function AlertFeed() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const socket = useSocket();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handleNewAlert = (data: any) => {
      setAlerts(prev => [data, ...prev]);
    };
    socket.on('alert:new', handleNewAlert);
    return () => { socket.off('alert:new', handleNewAlert); };
  }, [socket]);

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 h-full max-w-4xl mx-auto w-full">
      <div className="flex flex-col mb-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">Live Alert Feed <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div></h1>
      </div>
      
      <div className="flex flex-col gap-4">
        {alerts.length === 0 ? (
          <div className="text-center p-12 bg-card rounded-xl border border-border text-muted-foreground shadow-sm">
             <BellRing className="mx-auto h-12 w-12 opacity-50 mb-4" />
             No active alerts.
          </div>
        ) : alerts.map(alert => (
          <div key={`${alert.id}-${alert.createdAt}`} className="flex gap-4 p-5 bg-card text-card-foreground rounded-xl border border-border shadow-sm items-start relative overflow-hidden transition-all hover:shadow-md">
            <div className={`p-3 rounded-full shrink-0 ${alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : alert.severity === 'WARNING' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
              {alert.severity === 'INFO' ? <Info size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div className="flex-1 pt-1">
               <div className="flex justify-between items-baseline mb-1 pr-16">
                 <h3 className="font-bold text-lg">{alert.type.replace('_', ' ')}</h3>
                 <span className="text-xs text-muted-foreground font-medium">{format(new Date(alert.createdAt), 'HH:mm:ss a')}</span>
               </div>
               <p className="text-sm opacity-90">{alert.message}</p>
            </div>
            <button onClick={() => dismissAlert(alert.id)} className="absolute top-4 right-4 text-xs font-medium text-muted-foreground hover:text-foreground">Dismiss</button>
          </div>
        ))}
      </div>
    </div>
  );
}
