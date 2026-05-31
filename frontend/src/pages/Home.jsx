import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate(); // <-- The superpower to change pages!
  
  const [activeScreen, setActiveScreen] = useState('LANDING');
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('Loading...');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = { email, password, role: activeScreen };
    if (!isLogin) payload.name = name;
    if (!isLogin && activeScreen === 'SARATHI') {
      payload.vehicle = { make: vehicleMake, model: vehicleModel, licensePlate: vehiclePlate };
    }

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok) {
        setStatusMessage(`✅ Success! Redirecting...`);
        localStorage.setItem('sarathi_token', data.token);
        localStorage.setItem('sarathi_role', data.user.role);
        
        // 🚀 NEW: Teleport the user to their dashboard after 1 second!
        setTimeout(() => {
          if (data.user.role === 'YATRI') navigate('/yatri-dashboard');
          else navigate('/sarathi-dashboard');
        }, 1000);
        
      } else {
        setStatusMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setStatusMessage('❌ Server Error: Is your backend running?');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-teal-200 to-emerald-200 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* LANDING SCREEN */}
      {activeScreen === 'LANDING' && (
        <div className="bg-white/60 backdrop-blur-lg border border-white/40 shadow-2xl rounded-3xl p-8 max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-300/50 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-teal-800 mb-2">Sarathi App</h1>
          <p className="text-teal-700 font-semibold mb-8">Find Your Perfect Ride</p>
          <div className="space-y-4 text-left">
            <div onClick={() => { setActiveScreen('YATRI'); setStatusMessage(''); }} className="flex items-center justify-between p-4 rounded-xl bg-white/80 border shadow-sm hover:border-cyan-400 cursor-pointer group">
              <span className="text-sm font-bold text-teal-900">Yatri (Passenger)</span>
            </div>
            <div onClick={() => { setActiveScreen('SARATHI'); setStatusMessage(''); }} className="flex items-center justify-between p-4 rounded-xl bg-white/80 border shadow-sm hover:border-emerald-400 cursor-pointer group">
              <span className="text-sm font-bold text-teal-900">Sarathi (Driver)</span>
            </div>
          </div>
        </div>
      )}

      {/* AUTH SCREEN */}
      {activeScreen !== 'LANDING' && (
        <div className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-2xl rounded-3xl p-8 max-w-md w-full">
          <button onClick={() => setActiveScreen('LANDING')} className="text-teal-700 font-bold text-sm mb-6 hover:text-teal-900">← Back to Home</button>
          <h2 className="text-2xl font-extrabold text-teal-900 mb-6">{isLogin ? 'Welcome Back' : 'Join as a'} {activeScreen}</h2>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/80 border text-teal-900" />}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/80 border text-teal-900" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/80 border text-teal-900" />
            
            {!isLogin && activeScreen === 'SARATHI' && (
              <div className="pt-4 border-t border-teal-200/50 space-y-4">
                <input type="text" placeholder="Make (e.g. Honda)" value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/80 border" />
                <input type="text" placeholder="Model (e.g. City)" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/80 border" />
                <input type="text" placeholder="License Plate" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/80 border" />
              </div>
            )}
            <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-all">{isLogin ? 'Log In' : 'Create Account'}</button>
          </form>

          {statusMessage && <div className="mt-4 p-3 bg-teal-50 border text-teal-800 text-sm font-semibold rounded-lg text-center">{statusMessage}</div>}
          <p className="mt-6 text-center text-sm text-teal-700 font-medium">
            <button onClick={() => { setIsLogin(!isLogin); setStatusMessage(''); }} className="text-teal-900 font-bold hover:underline">{isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}</button>
          </p>
        </div>
      )}
    </div>
  );
}

export default Home;