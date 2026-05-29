// 1. Import the installed dependencies
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db'); // <-- NEW: Import our database connection

// 2. Connect to the Database
connectDB(); // <-- NEW: Run the connection code

// 2. Initialize the Express application
const app = express();

// 3. Set up middleware (allows us to send/receive JSON data safely)
app.use(cors());
app.use(express.json());

// --- NEW LINE: Tell the server to use our Auth routes ---
app.use('/api/auth', require('./routes/auth'));

// 4. Define a basic test route
app.get('/', (req, res) => {
  res.send('Sarathi Backend is running smoothly!');
});

// 5. Define the port and start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is officially running on http://localhost:${PORT}`);
});