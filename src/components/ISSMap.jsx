import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter map when ISS moves
const RecenterAutomatically = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), { animate: true });
  }, [lat, lon, map]);
  return null;
};

const customIcon = new L.Icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -25],
});

export const ISSMap = ({ currentPosition, path }) => {
  if (!currentPosition) return <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: '12px' }}></div>;

  return (
    <div style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer 
        center={[currentPosition.lat, currentPosition.lon]} 
        zoom={3} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterAutomatically lat={currentPosition.lat} lon={currentPosition.lon} />
        
        {path.length > 1 && (
          <Polyline 
            positions={path.map(p => [p.lat, p.lon])} 
            color="#ef4444" 
            weight={3} 
            opacity={0.7} 
            dashArray="10, 10" 
          />
        )}
        
        <Marker position={[currentPosition.lat, currentPosition.lon]} icon={customIcon}>
          <Popup>
            <strong>ISS is here!</strong><br/>
            Lat: {currentPosition.lat.toFixed(4)}<br/>
            Lon: {currentPosition.lon.toFixed(4)}<br/>
            Speed: {currentPosition.speed ? currentPosition.speed.toFixed(0) : 0} km/h
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};
