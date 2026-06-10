import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import socket from '../socket';
import { MapPin, Moon, Sun, Layers } from 'lucide-react'; // 🆕 Added UI Icons for our new buttons!

const carIcon = L.icon({
  iconUrl: 'https://img.icons8.com/color/96/car-roof.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position, { animate: true });
  }, [position, map]);
  return null;
}

function YatriDashboard() {
  const navigate = useNavigate();
  const [location, setLocation] = useState([20.0059, 73.7903]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [gpsError, setGpsError] = useState(null);

  const [pickup, setPickup] = useState('Current Location');
  const [destination, setDestination] = useState('');
  const [acceptedDriver, setAcceptedDriver] = useState(null);

  // 🆕 NEW: State for Dark Mode and Map Style
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mapStyle, setMapStyle] = useState('standard'); // 'standard', 'dark', 'satellite'

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => setLocation([position.coords.latitude, position.coords.longitude]),
      (error) => console.error(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    socket.on("receiveDriverLocation", (data) => setDriverLocation([data.lat, data.lng]));
    socket.on("rideAccepted", (data) => setAcceptedDriver(data));
    return () => {
      socket.off("receiveDriverLocation");
      socket.off("rideAccepted");
    };
  }, []);

  const handleBookRide = () => {
    if (!destination) return alert("Please enter a destination first!");
    socket.emit("requestRide", { pickupLocation: pickup, dropoffLocation: destination, coordinates: location });
  };

  // 🗺️ Map Skins (Protected by Environment Variables)
  const getMapTileUrl = () => {
    // Check if we are allowed to use the local Google hack
    const useGoogleHack = import.meta.env.VITE_USE_GOOGLE_MAPS === 'true';

    if (mapStyle === 'satellite') {
      return useGoogleHack 
        ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" 
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    }
    if (mapStyle === 'dark') {
      // Carto Dark Matter is universally safe and looks best for Dark Mode
      return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    }
    
    // Standard Mode
    return useGoogleHack
      ? "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  };

  // 🆕 NEW: Toggle function that synchronizes Dark Mode with the Dark Map!
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    setMapStyle(!isDarkMode ? 'dark' : 'standard');
  };

  return (
    // 🆕 Notice the dynamic 'dark' class added to the main wrapper!
    <div className={`h-screen w-screen flex flex-col relative overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Top Header - Updated with dark: Tailwind classes */}
      <div className="absolute top-0 left-0 w-full z-[1000] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center transition-colors">
        <div>
          <h1 className="text-2xl font-extrabold text-teal-800 dark:text-teal-400">Sarathi <span className="text-emerald-500">Yatri</span></h1>
          {gpsError && <p className="text-xs font-semibold text-red-500 mt-0.5">{gpsError}</p>}
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500/90 text-white font-bold rounded-lg hover:bg-red-600 shadow-md transition-all">Logout</button>
      </div>

      {/* 🆕 NEW: Floating Map Controls (Right Side) */}
      <div className="absolute top-24 right-4 z-[1000] flex flex-col gap-3">
        {/* Dark Mode Toggle */}
        <button onClick={toggleDarkMode} className="p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-amber-400 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-110 transition-all">
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        {/* Satellite Toggle */}
        <button onClick={() => setMapStyle(mapStyle === 'satellite' ? (isDarkMode ? 'dark' : 'standard') : 'satellite')} className={`p-3 rounded-full shadow-lg border hover:scale-110 transition-all ${mapStyle === 'satellite' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700'}`}>
          <Layers size={24} />
        </button>
      </div>

      {/* Map Canvas */}
      <div className="h-full w-full z-0 bg-slate-100 dark:bg-slate-900">
        <MapContainer center={location} zoom={15} className="h-full w-full" zoomControl={false}>
          {/* 🆕 Dynamically injecting the map skin here */}
          <TileLayer url={getMapTileUrl()} />
          <Marker position={location}><Popup>Pickup Point 📍</Popup></Marker>
          {driverLocation && <Marker position={driverLocation} icon={carIcon}><Popup>Your Cab 🚕</Popup></Marker>}
          <RecenterMap position={location} />
        </MapContainer>
      </div>

      {/* DYNAMIC BOTTOM PANEL - Updated with dark mode colors! */}
      <div className="absolute bottom-0 left-0 w-full z-[1000] p-4 sm:p-6 sm:w-[400px]">
        {acceptedDriver ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-5 border-t-4 border-emerald-500 transition-colors">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Driver is Arriving</h2>
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-600">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center text-2xl shadow-inner">👨🏽‍✈️</div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{acceptedDriver.driverName}</h3>
                  <p className="text-xs font-semibold text-amber-500">{acceptedDriver.rating}</p>
                </div>
              </div>
              <img src="https://img.icons8.com/color/96/car-roof.png" alt="car" className="w-14 h-14 drop-shadow-md" />
            </div>
            <div className="mt-4 flex justify-between items-center px-2">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Vehicle</p>
                <p className="font-bold text-slate-800 dark:text-white">{acceptedDriver.carModel}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Plate</p>
                <p className="font-extrabold text-slate-800 bg-yellow-400 px-2 py-0.5 rounded border border-yellow-500">{acceptedDriver.plateNumber}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-5 border border-slate-100 dark:border-slate-700 transition-colors">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Where to?</h2>
            <div className="relative flex flex-col gap-3">
              <div className="absolute left-[15px] top-[24px] bottom-[24px] w-0.5 bg-slate-200 dark:bg-slate-600"></div>
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-700 p-3 rounded-xl">
                <div className="w-3 h-3 bg-emerald-500 rounded-full z-10 shadow-sm border-2 border-white dark:border-slate-700"></div>
                <input type="text" value={pickup} onChange={(e) => setPickup(e.target.value)} className="bg-transparent w-full outline-none text-sm font-semibold text-slate-700 dark:text-white placeholder-slate-400" placeholder="Pickup Location" />
              </div>
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-700 p-3 rounded-xl">
                <MapPin size={16} className="text-rose-500 z-10" fill="currentColor" />
                <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="bg-transparent w-full outline-none text-sm font-semibold text-slate-700 dark:text-white placeholder-slate-400" placeholder="Search destination..." />
              </div>
            </div>
            <button onClick={handleBookRide} className="w-full mt-5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]">
              Find a Cab
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default YatriDashboard;