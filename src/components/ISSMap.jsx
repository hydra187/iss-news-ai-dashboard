import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const RecenterAutomatically = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), { animate: true });
  }, [lat, lon, map]);
  return null;
};

// Professional ISS SVG Marker
const customIcon = new L.DivIcon({
  className: 'custom-iss-icon',
  html: `
    <div style="background: rgba(251, 146, 60, 0.2); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #fb923c; box-shadow: 0 0 15px rgba(251, 146, 60, 0.4);">
      <div style="background: #fb923c; color: #000; font-size: 10px; font-weight: bold; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        ISS
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

export const ISSMap = ({ currentPosition, path }) => {
  if (!currentPosition) return <div className="skeleton" style={{ height: '350px', width: '100%', borderRadius: '8px' }}></div>;

  return (
    <div style={{ height: '350px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer 
        center={[currentPosition.lat, currentPosition.lon]} 
        zoom={3} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* CartoDB Dark Matter for a professional dark space look */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <RecenterAutomatically lat={currentPosition.lat} lon={currentPosition.lon} />
        
        {path.length > 1 && (
          <Polyline 
            positions={path.map(p => [p.lat, p.lon])} 
            color="#fb923c" 
            weight={2} 
            opacity={0.8} 
          />
        )}
        
        <Marker position={[currentPosition.lat, currentPosition.lon]} icon={customIcon}>
          <Popup className="custom-popup">
            <div style={{ fontFamily: 'Inter', color: '#000' }}>
              <strong>ISS Current Location</strong><br/>
              Lat: {currentPosition.lat.toFixed(4)}<br/>
              Lon: {currentPosition.lon.toFixed(4)}<br/>
              Speed: {currentPosition.speed ? currentPosition.speed.toFixed(0) : 0} km/h
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};
