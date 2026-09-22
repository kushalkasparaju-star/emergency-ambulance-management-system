import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../api';
import { useSocket } from '../hooks/useSocket';

const IconAmbulance = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1032/1032986.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});


const IconIncident = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/564/564619.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function GpsTracking() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [activeRoutes, setActiveRoutes] = useState<any[]>([]);
  const socket = useSocket();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ambRes = await api.get('/ambulances');
      const incRes = await api.get('/incidents');
      setAmbulances(ambRes.data);
      setIncidents(incRes.data);
    } catch (e) {
      console.error(e)
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onLocationUpdate = (data: any) => {
      setAmbulances(prev => prev.map(a => a.unitCode === data.unitId ? { ...a, lat: data.lat, lng: data.lng } : a));
    };
    
    const onStatusUpdate = (data: any) => {
      setAmbulances(prev => prev.map(a => a.unitCode === data.unitId ? { ...a, status: data.status } : a));
    };

    const onIncidentUpdate = (data: any) => {
      setIncidents(prev => prev.map(i => i.id === data.incidentId ? { ...i, status: data.status } : i));
    };

    socket.on('ambulance:location_update', onLocationUpdate);
    socket.on('ambulance:status_update', onStatusUpdate);
    socket.on('incident:update', onIncidentUpdate);

    return () => {
      socket.off('ambulance:location_update', onLocationUpdate);
      socket.off('ambulance:status_update', onStatusUpdate);
      socket.off('incident:update', onIncidentUpdate);
    };
  }, [socket]);

  const dispatchAmbulance = async (incidentId: number, ambulanceIndex: number) => {
    const availableAmbulances = ambulances.filter(a => a.status === 'AVAILABLE');
    const amb = availableAmbulances[ambulanceIndex];
    if (!amb || !socket) return;
    
    const inc = incidents.find(i => i.id === incidentId);
    if (!inc) return;

    try {
      const res = await api.post('/routes/optimize', {
        from: { lat: amb.lat, lng: amb.lng },
        to: { lat: inc.lat, lng: inc.lng },
        avoidTraffic: false
      });

      socket.emit('ambulance:dispatch', {
        unitId: amb.unitCode,
        incidentId: incidentId,
        route: res.data
      });
      
      setActiveRoutes(prev => [...prev, res.data.waypoints]);
    } catch (e) {
      console.error(e);
      alert('Routing API failed. Starting move without polyline.');
      socket.emit('ambulance:dispatch', {
        unitId: amb.unitCode,
        incidentId: incidentId
      });
    }
  };

  const center: [number, number] = [25.7617, -80.1918]; // Miami

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      <div className="w-full md:w-3/4 rounded-xl overflow-hidden shadow-lg border border-border flex flex-col relative z-0">
         <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {ambulances.map(amb => (
              <Marker key={`amb-${amb.id}`} position={[amb.lat, amb.lng]} icon={IconAmbulance}>
                <Popup>
                  <div className="font-bold text-center mb-1">{amb.unitCode}</div>
                  <div className={`text-xs px-2 py-1 rounded text-center ${amb.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>Status: {amb.status}</div>
                </Popup>
              </Marker>
            ))}
            {incidents.filter(i => i.status !== 'RESOLVED').map(inc => (
              <Marker key={`inc-${inc.id}`} position={[inc.lat, inc.lng]} icon={IconIncident}>
                <Popup>
                  <div className="font-bold mb-1">{inc.type.replace('_', ' ')}</div>
                  <div className="text-xs mb-2">Severity: <span className="text-destructive font-semibold">{inc.severity}</span></div>
                  {inc.status === 'OPEN' && (
                    <div className="mt-2 text-xs">
                      <p className="mb-1 text-muted-foreground">Dispatch Unit:</p>
                      {ambulances.filter(a => a.status === 'AVAILABLE').map((a, idx) => (
                         <button key={a.id} onClick={() => dispatchAmbulance(inc.id, idx)} className="block bg-primary text-primary-foreground font-medium px-2 py-1.5 rounded w-full mb-1 hover:bg-primary/90 transition-colors">
                           {a.unitCode}
                         </button>
                      ))}
                      {ambulances.filter(a => a.status === 'AVAILABLE').length === 0 && <span className="text-red-500">No units available</span>}
                    </div>
                  )}
                  {inc.status === 'ASSIGNED' && (
                    <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">Assigned to: {inc.assignedAmbulanceId || 'Unit'}</div>
                  )}
                </Popup>
              </Marker>
            ))}
            {activeRoutes.map((route, i) => (
              <Polyline key={`route-${i}`} positions={route.map((r: any) => [r.lat, r.lng])} color="#3b82f6" weight={5} opacity={0.7} />
            ))}
         </MapContainer>
      </div>
      <div className="w-full md:w-1/4 flex flex-col gap-4 overflow-y-auto">
        <div className="p-4 bg-card text-card-foreground rounded-xl border border-border shadow-sm flex-1">
          <h2 className="text-lg font-bold mb-3 border-b pb-2">Active Units</h2>
          {ambulances.map(a => (
            <div key={a.id} className="flex justify-between items-center text-sm py-3 border-b border-border/50 last:border-0">
              <span className="font-medium text-base">{a.unitCode}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${a.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 dark:bg-green-900/40' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40'}`}>
                {a.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
        <div className="p-4 bg-card text-card-foreground rounded-xl border border-border shadow-sm flex-1">
          <h2 className="text-lg font-bold mb-3 border-b pb-2">Open Incidents</h2>
          {incidents.filter(i => i.status === 'OPEN').map(inc => (
            <div key={inc.id} className="text-sm py-3 border-b border-border/50 last:border-0 flex justify-between items-center">
              <span className="font-medium text-base capitalize">{inc.type.replace('_', ' ').toLowerCase()}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${inc.severity==='CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-900/40' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40'}`}>
                 {inc.severity}
              </span>
            </div>
          ))}
          {incidents.filter(i => i.status === 'OPEN').length === 0 && <div className="text-sm text-muted-foreground py-4 text-center">No open incidents. Relax!</div>}
        </div>
      </div>
    </div>
  );
}
