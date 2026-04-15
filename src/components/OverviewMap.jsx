import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useComplaintStore } from '../store/useComplaintStore';
import { useRegionStore } from '../store/useRegionStore';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function RecenterMap({ coords }) {
  const map = useMap();
  map.setView(coords, 13);
  return null;
}

export default function OverviewMap() {
  const { complaints } = useComplaintStore();
  const { userRegion } = useRegionStore();
  
  // Default coordinates for Kochi
  const defaultCoords = [9.9816, 76.2999];
  const activeCoords = (complaints.length > 0 && complaints[0].location.lat) 
    ? [complaints[0].location.lat, complaints[0].location.lng] 
    : defaultCoords;

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-glass">
      <MapContainer center={activeCoords} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <RecenterMap coords={activeCoords} />
        {complaints.map((c) => (
          <Marker key={c.id} position={[c.location.lat, c.location.lng]}>
            <Popup className="custom-popup">
              <div className="p-2 min-w-[150px]">
                <h3 className="font-bold text-sm mb-1">{c.title}</h3>
                <p className={`text-[10px] font-bold uppercase mb-2 ${c.status === 'Resolved' ? 'text-success' : 'text-warning'}`}>{c.status}</p>
                <div className="flex gap-2 text-xs">
                  <span className="text-textSecondary">ID:</span>
                  <span className="font-mono text-primary font-bold">{c.id}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
