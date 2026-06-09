import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import socket from '../socket';

// 🧭 Advanced Math
const calculateBearing = (startLat, startLng, destLat, destLng) => {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;
  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
            Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  let brng = Math.atan2(y, x);
  return ((brng * 180) / Math.PI + 360) % 360;
};

// 🚗 Dynamic Rotating Car Icon
const getCarIcon = (rotation) => {
  return L.divIcon({
    className: '',
    html: `
      <div style="transform: rotate(${rotation}deg); transition: transform 0.5s ease-out; width: 40px; height: 40px;">
        <img src="https://img.icons8.com/color/96/car-roof.png" style="width: 100%; height: 100%; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.5));" />
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position, { animate: true });
  }, [position, map]);
  return null;
}

function YatriDashboard() {
  const navigate = useNavigate();
  
  // 📍 Updated Default Location to NASHIK!
  const [location, setLocation] = useState([20.0059, 73.7903]);
  const [gpsError, setGpsError] = useState(null);
  
  const [driverLocation, setDriverLocation] = useState(null);
  const [carRotation, setCarRotation] = useState(0); // 🔄 Tracks which way the cab is facing

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // 1️⃣ Rider GPS
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 2️⃣ Listen for the Cab & Calculate its rotation!
  useEffect(() => {
    socket.on("receiveDriverLocation", (data) => {
      setDriverLocation((prevLoc) => {
        if (prevLoc) {
          // If we know where the cab WAS, calculate the angle to where it IS NOW
          const angle = calculateBearing(prevLoc[0], prevLoc[1], data.lat, data.lng);
          setCarRotation(angle);
        }
        return [data.lat, data.lng];
      });
    });
    return () => socket.off("receiveDriverLocation");
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col relative">
      <div className="absolute top-0 left-0 w-full z-[1000] bg-white/80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-teal-800">Sarathi <span className="text-emerald-500">Yatri</span></h1>
          {gpsError && <p className="text-xs font-semibold text-red-500 mt-0.5">{gpsError}</p>}
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500/90 text-white font-bold rounded-lg hover:bg-red-600 transition-all shadow-md">Logout</button>
      </div>

      <div className="h-full w-full z-0">
        <MapContainer center={location} zoom={15} className="h-full w-full">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
          
          {/* 📍 Rider Marker (Remains Blue Pin) */}
          <Marker position={location}>
            <Popup><span className="font-bold text-teal-800 text-xs">Pickup Point 📍</span></Popup>
          </Marker>

          {/* 🚗 Moving & Rotating Cab Marker */}
          {driverLocation && (
            <Marker position={driverLocation} icon={getCarIcon(carRotation)}>
              <Popup><span className="font-bold text-amber-600 text-xs">Your Cab 🚕</span></Popup>
            </Marker>
          )}

          <RecenterMap position={location} />
        </MapContainer>
      </div>
    </div>
  );
}

export default YatriDashboard;