import React from 'react';
import { useNavigate } from 'react-router-dom';

function SarathiDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-emerald-600 mb-4">Sarathi Map Goes Here 🗺️</h1>
      <button onClick={handleLogout} className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">Logout</button>
    </div>
  );
}

export default SarathiDashboard;