const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

// 🔌 NEW: Import the WebSocket tools
const http = require('http'); 
const { Server } = require('socket.io');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// --- 🌐 NEW: Socket.io Real-Time Pipeline Setup ---
const server = http.createServer(app); // We wrap Express inside a core HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Only allow your React frontend to connect
    methods: ["GET", "POST"]
  }
});

// The "Switchboard" - Listens for users connecting to the app
io.on("connection", (socket) => {
  console.log(`🔌 New connection established! User ID: ${socket.id}`);

  // 📡 Listen for a driver sending their live location
  socket.on("driverLocationUpdate", (data) => {
    // 📢 Broadcast that driver's location to ALL riders instantly
    socket.broadcast.emit("receiveDriverLocation", data);
  });

  // When a user closes the app or logs out
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});
// --------------------------------------------------

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch((err) => console.log('MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;

// ⚠️ CRITICAL: We must use server.listen now instead of app.listen!
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} with WebSockets active!`);
});