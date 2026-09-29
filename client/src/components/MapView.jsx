import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatDistance } from '../utils/helpers';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom hospital marker icon
const hospitalIcon = new L.DivIcon({
  html: `<div style="background: linear-gradient(135deg, #0077B6, #005f92); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
    <span style="transform: rotate(45deg); color: white; font-size: 14px; font-weight: bold;">+</span>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// User location marker
const userIcon = new L.DivIcon({
  html: `<div style="position: relative;">
    <div style="width: 18px; height: 18px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 15px rgba(59,130,246,0.6);"></div>
    <div style="position: absolute; top: -3px; left: -3px; width: 24px; height: 24px; background: rgba(59,130,246,0.2); border-radius: 50%; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
  </div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Component to recenter map
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function MapView({ hospitals = [], userLocation, onHospitalClick, selectedHospital, className = '' }) {
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [28.6139, 77.2090]; // Delhi default

  return (
    <div className={`rounded-2xl overflow-hidden border border-white/10 ${className}`}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <RecenterMap center={center} />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-sm">📍 Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Hospital markers */}
        {hospitals.map((h) => (
          <Marker
            key={h._id}
            position={[h.location.lat, h.location.lng]}
            icon={hospitalIcon}
            eventHandlers={{
              click: () => onHospitalClick?.(h),
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <h3 className="font-bold text-sm mb-1">{h.name}</h3>
                {h.distance !== undefined && (
                  <p className="text-xs opacity-80 mb-1">📍 {formatDistance(h.distance)}</p>
                )}
                <div className="flex gap-3 text-xs">
                  <span>🛏️ {h.bedsAvailable}/{h.totalBeds}</span>
                  <span>🏥 ICU: {h.icuAvailable}/{h.totalIcu}</span>
                </div>
                <p className="text-xs mt-1">⏱️ Wait: {h.waitingTime} min</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
