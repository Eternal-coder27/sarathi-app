import React, { useState } from 'react';

function App() {
  const [activeScreen, setActiveScreen] = useState('LANDING');
  const [isLogin, setIsLogin] = useState(false);
  
  // 1. New State to hold what the user types
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  
  // 2. New State to show success or error messages
  const [statusMessage, setStatusMessage] = useState('');

  // 3. The function that talks to the Backend
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    setStatusMessage('Loading...');

    // Decide if we are logging in or registering
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    // Build the data packet to send
    const payload = {
      email: email,
      password: password,
      role: activeScreen // 'YATRI' or 'SARATHI'
    };

    // Add Name if they are registering
    if (!isLogin) payload.name = name;

    // Add Vehicle if they are a registering Sarathi
    if (!isLogin && activeScreen === 'SARATHI') {
      payload.vehicle = {
        make: vehicleMake,
        model: vehicleModel,
        licensePlate: vehiclePlate
      };
    }

    try {
      // Send the data to your Node.js backend!
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage(`✅ Success! Token generated: ${data.token.substring(0, 15)}...`);

        localStorage.setItem('sarathi_token', data.token);
        localStorage.setItem('sarathi_role', data.user.role);
      } else {
        setStatusMessage(`❌ Error: ${data.message || 'Something went wrong'}`);
      }
    } catch (error) {
      setStatusMessage('❌ Server Error: Is your Node.js backend running?');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-teal-200 to-emerald-200 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* ----------------- LANDING SCREEN ----------------- */}
      {activeScreen === 'LANDING' && (
        <div className="bg-white/60 backdrop-blur-lg border border-white/40 shadow-2xl rounded-3xl p-8 max-w-md w-full text-center transform transition-all duration-300">
          
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-300/50 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>

          <h1 className="text-4xl font-extrabold text-teal-800 mb-2">Sarathi App</h1>
          <p className="text-teal-700 font-semibold mb-8">Find Your Perfect Ride</p>

          <div className="space-y-4 text-left">
            <div 
              onClick={() => { setActiveScreen('YATRI'); setStatusMessage(''); }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-white shadow-sm hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <span className="text-sm font-bold text-teal-900 group-hover:text-cyan-600 transition-colors">Yatri (Passenger)</span>
              <span className="text-xs text-cyan-700 bg-cyan-100 px-3 py-1 rounded-full font-bold">Ready</span>
            </div>
            
            <div 
              onClick={() => { setActiveScreen('SARATHI'); setStatusMessage(''); }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-white shadow-sm hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <span className="text-sm font-bold text-teal-900 group-hover:text-emerald-600 transition-colors">Sarathi (Driver)</span>
              <span className="text-xs text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full font-bold">Ready</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- AUTHENTICATION SCREEN ----------------- */}
      {activeScreen !== 'LANDING' && (
        <div className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-2xl rounded-3xl p-8 max-w-md w-full animate-fade-in">
          
          <button 
            onClick={() => setActiveScreen('LANDING')}
            className="text-teal-700 font-bold text-sm mb-6 flex items-center hover:text-teal-900 transition-colors"
          >
            ← Back to Home
          </button>

          <h2 className="text-2xl font-extrabold text-teal-900 mb-2">
            {isLogin ? 'Welcome Back,' : 'Join as a'} {activeScreen === 'YATRI' ? 'Yatri' : 'Sarathi'}
          </h2>
          <p className="text-teal-700 font-medium mb-6">
            {isLogin ? 'Enter your details to log in.' : 'Fill out the form below to get started.'}
          </p>

          {/* Form matches the handleSubmit function */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {!isLogin && (
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400 text-teal-900 font-medium"
              />
            )}
            
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/80 border border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400 text-teal-900 font-medium"
            />
            
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/80 border border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400 text-teal-900 font-medium"
            />

            {!isLogin && activeScreen === 'SARATHI' && (
              <div className="pt-4 mt-4 border-t border-teal-200/50 space-y-4">
                <h3 className="text-xs font-bold text-teal-700 uppercase tracking-wider">Vehicle Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Make" value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/80 border border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400 text-teal-900 font-medium" />
                  <input type="text" placeholder="Model" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/80 border border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400 text-teal-900 font-medium" />
                </div>
                <input type="text" placeholder="License Plate" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/80 border border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400 text-teal-900 font-medium" />
              </div>
            )}

            <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl mt-6 hover:bg-teal-700 shadow-lg shadow-teal-500/30 transition-all active:scale-95">
              {isLogin ? 'Log In' : 'Create Account'}
            </button>
          </form>

          {/* Feedback Message Box */}
          {statusMessage && (
            <div className="mt-4 p-3 bg-teal-50 border border-teal-100 text-teal-800 text-sm font-semibold rounded-lg text-center animate-fade-in">
              {statusMessage}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-teal-700 font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setStatusMessage(''); }} 
              className="text-teal-900 font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      )}

    </div>
  );
}

export default App;