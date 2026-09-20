import { useState } from 'react';
import { Map, Zap, CarFront, Navigation, Route as RouteIcon } from 'lucide-react';

export default function RouteOptimization() {
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);

  const optimizeRoute = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setRoutes([
          { type: 'Fastest', distanceKm: 4.2, etaMin: 6.5, signalCount: 3, congestionScore: 'Low', selected: true },
          { type: 'Shortest Distance', distanceKm: 3.8, etaMin: 8.2, signalCount: 6, congestionScore: 'Medium', selected: false },
          { type: 'Avoid Traffic', distanceKm: 5.1, etaMin: 7.0, signalCount: 2, congestionScore: 'Very Low', selected: false },
        ]);
        setLoading(false);
      }, 1500);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full max-w-5xl mx-auto w-full">
      <div className="flex flex-col mb-4 bg-card text-card-foreground p-6 rounded-xl border border-border">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Map size={28}/> Route Optimization Sandbox</h1>
        <p className="text-muted-foreground mb-6">Test the routing engine by generating alternative routes to active incidents.</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
           <div className="flex-1">
             <label className="block text-sm font-medium mb-1">Origin Unit</label>
             <select className="w-full p-2.5 rounded-md border border-input bg-transparent">
                <option>ENG-01 (Available)</option>
                <option>ENG-02 (Available)</option>
             </select>
           </div>
           <div className="flex-1">
             <label className="block text-sm font-medium mb-1">Destination Incident</label>
             <select className="w-full p-2.5 rounded-md border border-input bg-transparent">
                <option>CAR_CRASH (Critical)</option>
                <option>FIRE (Medium)</option>
             </select>
           </div>
        </div>
        <button 
          onClick={optimizeRoute} 
          disabled={loading}
          className="flex items-center justify-center gap-2 mt-2 w-full md:w-auto md:px-8 p-3 rounded-md bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Crunching OSRM data...' : <><Zap size={18} fill="currentColor" /> Run Optimizer</>}
        </button>
      </div>

      {routes.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {routes.map((r, i) => (
             <div key={i} className={`p-6 rounded-xl border cursor-pointer transition-all ${r.selected ? 'bg-primary/5 border-primary ring-2 ring-primary/20' : 'bg-card border-border hover:border-primary/50 text-card-foreground'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-xl">{r.type}</h3>
                  {r.selected && <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Active Choice</span>}
                </div>
                
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-secondary rounded-lg text-secondary-foreground"><Navigation size={20}/></div>
                     <div>
                       <div className="text-sm text-muted-foreground">ETA</div>
                       <div className="font-semibold text-lg">{r.etaMin.toFixed(1)} mins</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-secondary rounded-lg text-secondary-foreground"><RouteIcon size={20}/></div>
                     <div>
                       <div className="text-sm text-muted-foreground">Distance</div>
                       <div className="font-semibold">{r.distanceKm.toFixed(1)} km</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-secondary rounded-lg text-secondary-foreground"><CarFront size={20}/></div>
                     <div>
                       <div className="text-sm text-muted-foreground">Congestion & Signals</div>
                       <div className="font-semibold">{r.congestionScore} • {r.signalCount} signals</div>
                     </div>
                   </div>
                </div>
             </div>
           ))}
         </div>
      )}
    </div>
  );
}
