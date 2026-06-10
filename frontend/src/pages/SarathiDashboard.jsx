import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import socket from '../socket';

// 🚗 Bulletproof Static Car Icon (Fixes the Leaflet bug)
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

function SarathiDashboard() {
  const navigate = useNavigate();
  
  const [location, setLocation] = useState([20.0059, 73.7903]); // Nashik Default
  const [gpsError, setGpsError] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // 🔔 Tracks if a rider is calling for a cab
  const [incomingRide, setIncomingRide] = useState(null);

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
          setLocation([latitude, longitude]);
          setGpsError(null);

          // Broadcast real location
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
          
          // Broadcast fake location
          socket.emit("driverLocationUpdate", { lat: newLat, lng: newLng });
          return [newLat, newLng];
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  // 3️⃣ Listen for incoming ride requests from the backend!
  useEffect(() => {
    socket.on("incomingRideRequest", (rideDetails) => {
      console.log("🚨 RIDE REQUEST RECEIVED:", rideDetails);
      setIncomingRide(rideDetails); // Triggers the popup UI!
    });

    return () => socket.off("incomingRideRequest");
  }, []);

  // ✅ NEW: Function to accept the ride
  const handleAcceptRide = () => {
    // 📢 Tell the backend you accepted, and send your car details!
    socket.emit("acceptRide", {
      driverName: "Ramesh Kumar", 
      carModel: "Red Swift Dzire",
      plateNumber: "MH 15 AB 1234",
      rating: "4.8 ★",
      pickupLocation: incomingRide.pickupLocation
    });

    setIncomingRide(null); // Close the popup
    alert("Navigating to Rider! 📍"); // You are now on duty!
  };

  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden">
      
      {/* Top Header */}
      <div className="absolute top-0 left-0 w-full z-[1000] bg-white/90 backdrop-blur-md shadow-md p-4 flex justify-between items-center border-b-4 border-amber-500">
        <div>
          <h1 className="text-2xl font-extrabold text-teal-800">Sarathi <span className="text-amber-500">Driver</span></h1>
          {gpsError && <p className="text-xs font-semibold text-red-500 mt-0.5">{gpsError}</p>}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSimulating(!isSimulating)} className={`px-4 py-2 text-sm sm:text-base font-bold rounded-lg transition-all shadow-md flex items-center gap-2 ${isSimulating ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
            {isSimulating ? '🛑 Stop' : '🕹️ Simulate'}
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500/90 text-white font-bold rounded-lg hover:bg-red-600 transition-all shadow-md">
            Logout
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="h-full w-full z-0">
        <MapContainer center={location} zoom={15} className="h-full w-full" zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          
          <Marker position={location} icon={carIcon}>
            <Popup><span className="font-bold text-amber-600 text-xs">Your Cab 🚕</span></Popup>
          </Marker>

          <RecenterMap position={location} />
        </MapContainer>
      </div>

      {/* 🚨 Incoming Ride Popup Overlay */}
      {incomingRide && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[2000] w-[90%] max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-500 animate-bounce">
            
            {/* Header */}
            <div className="bg-amber-500 text-white p-3 text-center font-bold">
              🔔 New Ride Request!
            </div>
            
            {/* Details */}
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mt-1.5 shrink-0 shadow-sm"></div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pickup</p>
                  <p className="font-semibold text-slate-800">{incomingRide.pickupLocation}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full mt-1.5 shrink-0 shadow-sm"></div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dropoff</p>
                  <p className="font-semibold text-slate-800">{incomingRide.dropoffLocation}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex bg-slate-50 border-t border-slate-100 p-3 gap-3">
              <button 
                onClick={() => setIncomingRide(null)} 
                className="flex-1 py-2.5 font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Decline
              </button>
              <button 
                onClick={handleAcceptRide} 
                className="flex-1 py-2.5 font-bold text-white bg-amber-500 rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-500/30 transition-all active:scale-95"
              >
                Accept
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}

export default SarathiDashboard;