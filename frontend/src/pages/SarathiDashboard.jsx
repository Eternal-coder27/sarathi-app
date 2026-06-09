import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import socket from '../socket';

// 🧭 Advanced Math: Calculates the compass direction (0-360 degrees) between two GPS points
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
    className: '', // Removes standard Leaflet styling
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

function SarathiDashboard() {
  const navigate = useNavigate();
  
  // 📍 Updated Default Location to NASHIK!
  const [location, setLocation] = useState([20.0059, 73.7903]);
  const [gpsError, setGpsError] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // 🔄 NEW: Tracks which way the car is facing
  const [carRotation, setCarRotation] = useState(0);
  const prevLocRef = useRef([20.0059, 73.7903]); // Remembers old location for math

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // 1️⃣ Real GPS Tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!isSimulating) {
          const { latitude, longitude } = position.coords;
          
          // Calculate which way we drove
          const angle = calculateBearing(prevLocRef.current[0], prevLocRef.current[1], latitude, longitude);
          if (latitude !== prevLocRef.current[0] || longitude !== prevLocRef.current[1]) {
             setCarRotation(angle);
          }

          prevLocRef.current = [latitude, longitude];
          setLocation([latitude, longitude]);
          setGpsError(null);

          socket.emit("driverLocationUpdate", { lat: latitude, lng: longitude });
        }
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isSimulating]);

  // 2️⃣ Autopilot Simulator
  useEffect(() => {
    let interval;
    if (isSimulating) {
      interval = setInterval(() => {
        setLocation((prevLoc) => {
          // Drive North-East through Nashik
          const newLat = prevLoc[0] + 0.0003; 
          const newLng = prevLoc[1] + 0.0003; 
          
          const angle = calculateBearing(prevLoc[0], prevLoc[1], newLat, newLng);
          setCarRotation(angle);

          socket.emit("driverLocationUpdate", { lat: newLat, lng: newLng });
          return [newLat, newLng];
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="h-screen w-screen flex flex-col relative">
      <div className="absolute top-0 left-0 w-full z-[1000] bg-white/90 backdrop-blur-md shadow-md p-4 flex justify-between items-center border-b-4 border-amber-500">
        <div>
          <h1 className="text-2xl font-extrabold text-teal-800">Sarathi <span className="text-amber-500">Driver</span></h1>
          {gpsError && <p className="text-xs font-semibold text-red-500 mt-0.5">{gpsError}</p>}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSimulating(!isSimulating)} className={`px-4 py-2 font-bold rounded-lg transition-all shadow-md flex items-center gap-2 ${isSimulating ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
            {isSimulating ? '🛑 Stop Driving' : '🕹️ Simulate Driving'}
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500/90 text-white font-bold rounded-lg hover:bg-red-600 transition-all shadow-md">
            Logout
          </button>
        </div>
      </div>

      <div className="h-full w-full z-0">
        <MapContainer center={location} zoom={15} className="h-full w-full">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
          
          {/* 🚗 Dynamic Car Marker */}
          <Marker position={location} icon={getCarIcon(carRotation)}>
            <Popup><span className="font-bold text-amber-600 text-xs">Your Cab 🚕</span></Popup>
          </Marker>

          <RecenterMap position={location} />
        </MapContainer>
      </div>
    </div>
  );
}

export default SarathiDashboard;