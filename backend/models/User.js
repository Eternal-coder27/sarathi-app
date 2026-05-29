const mongoose = require('mongoose');

// Creating the blueprint for what a User looks like in our database
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have the same email
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['YATRI', 'SARATHI'], // It MUST be one of these two exact words
    default: 'RIDER',
  },
  // The vehicle section is optional because Riders won't have it
  vehicle: {
    make: { type: String },   // e.g., "Honda"
    model: { type: String },  // e.g., "City"
    color: { type: String },  // e.g., "White"
    plate: { type: String }   // e.g., "DL-8C-1234"
  }
}, { 
  timestamps: true // This automatically adds "createdAt" and "updatedAt" dates to every user!
});

// Export the blueprint so the rest of our app can use it to create users
module.exports = mongoose.model('User', userSchema);