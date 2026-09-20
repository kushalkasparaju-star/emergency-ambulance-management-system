import { useState, useEffect } from 'react';
import { api } from '../api';
import { useSocket } from '../hooks/useSocket';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

export default function SystemLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const socket = useSocket();

  const fetchLogs = async (p: number) => {
    try {
      const res = await api.get(`/logs?page=${p}`);
      setLogs(p === 1 ? res.data.logs : [...logs, ...res.data.logs]);
      setTotalPages(res.data.pages);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNewLog = (data: any) => {
      setLogs(prev => [data, ...prev]);
    };
    socket.on('log:new', handleNewLog);
    return () => { socket.off('log:new', handleNewLog); };
  }, [socket]);

  return (
    <div className="flex flex-col gap-6 h-full max-w-6xl mx-auto w-full">
      <div className="flex flex-col mb-4">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Activity size={28}/> System Audit Logs</h1>
        <p className="text-muted-foreground mt-2">Real-time un-tamperable event logging.</p>
      </div>

      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-14rem)]">
         <div className="overflow-x-auto flex-1 h-full overflow-y-auto">
           <table className="w-full text-sm text-left">
             <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border sticky top-0 backdrop-blur">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Level</th>
                  <th className="px-6 py-4 font-semibold">Module</th>
                  <th className="px-6 py-4 font-semibold">Message</th>
                  <th className="px-6 py-4 font-semibold">Unit ID</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-border">
               {logs.map(log => (
                 <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                   <td className="px-6 py-3 whitespace-nowrap">{format(new Date(log.createdAt), 'MM/dd HH:mm:ss')}</td>
                   <td className="px-6 py-3">
                     <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${log.level === 'INFO' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>{log.level}</span>
                   </td>
                   <td className="px-6 py-3 font-medium">{log.module}</td>
                   <td className="px-6 py-3">{log.message}</td>
                   <td className="px-6 py-3 text-muted-foreground">{log.unitId || '-'}</td>
                 </tr>
               ))}
               {logs.length === 0 && (
                   <tr>
                       <td colSpan={5} className="text-center p-8 text-muted-foreground">No logs found</td>
                   </tr>
               )}
             </tbody>
           </table>
         </div>
         {page < totalPages && (
            <div className="p-4 border-t border-border bg-card text-center">
              <button onClick={() => { setPage(p => p + 1); fetchLogs(page + 1); }} className="text-sm font-medium hover:text-primary transition-colors">Load Older</button>
            </div>
         )}
      </div>
    </div>
  );
}
