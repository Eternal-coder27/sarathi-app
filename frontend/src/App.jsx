import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import YatriDashboard from './pages/YatriDashboard';
import SarathiDashboard from './pages/SarathiDashboard';

// 🛡️ THE BOUNCER
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('sarathi_token');
  const role = localStorage.getItem('sarathi_role');

  if (!token) return <Navigate to="/" />; // No VIP token? Kick them out!
  if (role !== allowedRole) return <Navigate to="/" />; // Wrong role? Kick them out!
  
  return children; // They are allowed in!
};

function App() {
  return (
    <Routes>
      {/* 🔓 Public Route */}
      <Route path="/" element={<Home />} />

      {/* 🔒 Protected Routes */}
      <Route 
        path="/yatri-dashboard" 
        element={<ProtectedRoute allowedRole="YATRI"><YatriDashboard /></ProtectedRoute>} 
      />
      <Route 
        path="/sarathi-dashboard" 
        element={<ProtectedRoute allowedRole="SARATHI"><SarathiDashboard /></ProtectedRoute>} 
      />
    </Routes>
  );
}

export default App;