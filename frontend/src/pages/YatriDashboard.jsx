import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // <-- CRITICAL: Without this, the map will look broken!

function YatriDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Setting the default map center to New Delhi!
  const defaultLocation = [28.6139, 77.2090]; 

  return (
    <div className="h-screen w-screen flex flex-col relative">
      
      {/* 🔝 Floating Header overlaying the map */}
      <div className="absolute top-0 left-0 w-full z-[1000] bg-white/80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-teal-800">Sarathi <span className="text-emerald-500">Yatri</span></h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500/90 text-white font-bold rounded-lg hover:bg-red-600 transition-all shadow-md">
          Logout
        </button>
      </div>

      {/* 🗺️ The Map Canvas */}
      <div className="h-full w-full z-0">
        <MapContainer center={defaultLocation} zoom={13} className="h-full w-full">
          
          {/* 🎨 The Premium Carto Map Skin (No API Key needed!) */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
          />

          {/* 📍 A simple test marker */}
          <Marker position={defaultLocation}>
            <Popup>
              Pickup Location 📍
            </Popup>
          </Marker>

        </MapContainer>
      </div>

    </div>
  );
}

export default YatriDashboard;