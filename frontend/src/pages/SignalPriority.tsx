import { useEffect, useState } from 'react';
import { api } from '../api';
import { useSocket } from '../hooks/useSocket';

export default function SignalPriority() {
  const [signals, setSignals] = useState<any[]>([]);
  const socket = useSocket();

  useEffect(() => {
    fetchSignals();
  }, []);

  const fetchSignals = async () => {
    try {
      const res = await api.get('/signals');
      setSignals(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handleSignalChange = (data: any) => {
      setSignals(prev => prev.map(s => s.id === data.signalId ? { ...s, status: data.status, priorityMode: data.priorityMode } : s));
    };
    socket.on('signal:status_change', handleSignalChange);
    return () => { socket.off('signal:status_change', handleSignalChange); };
  }, [socket]);

  // Demo fallback trigger for manual testing
  const triggerPriority = async (id: number, mode: string) => {
    await api.post(`/signals/${id}/priority`, { priorityMode: mode, triggeredBy: 'Manual Trigger' });
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col mb-4">
        <h1 className="text-3xl font-bold">Traffic Signal Preemption</h1>
        <p className="text-muted-foreground mt-2">Signals auto-flip to PRIORITY or PREEMPTION based on proximity simulation.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {signals.map(signal => (
          <div key={signal.id} className="p-6 bg-card text-card-foreground rounded-xl border border-border shadow-sm flex flex-col items-center">
            <h3 className="font-bold text-lg mb-4 text-center h-12 leading-tight">{signal.intersectionName}</h3>
            
            <div className="bg-slate-800 p-4 rounded-3xl flex flex-col gap-3 shadow-inner w-24 items-center">
              <div className={`w-12 h-12 rounded-full ${signal.status === 'RED' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-red-900 opacity-30'}`}></div>
              <div className={`w-12 h-12 rounded-full ${signal.status === 'AMBER' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]' : 'bg-amber-900 opacity-30'}`}></div>
              <div className={`w-12 h-12 rounded-full ${signal.status === 'GREEN' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]' : 'bg-green-900 opacity-30'}`}></div>
            </div>

            <div className="mt-6 flex flex-col gap-2 w-full text-center">
              <span className={`px-3 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider ${
                signal.priorityMode === 'NORMAL' ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' :
                signal.priorityMode === 'PRIORITY' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50' :
                'bg-red-100 text-red-800 dark:bg-red-900/50'
              }`}>
                Mode: {signal.priorityMode}
              </span>
            </div>

            <div className="mt-4 flex gap-2 w-full">
               <button onClick={() => triggerPriority(signal.id, 'PREEMPTION')} className="flex-1 text-xs py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded transition-colors font-medium">Test Preemption</button>
               <button onClick={() => triggerPriority(signal.id, 'NORMAL')} className="flex-1 text-xs py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded transition-colors font-medium">Reset</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
