const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Bring in our blueprint!

const router = express.Router();

// ==========================================
// 1. REGISTER A NEW USER (Rider or Driver)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, vehicle } = req.body;

    // Check if the email is already in use
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email!' });
    }

    // Scramble (Hash) the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user using our blueprint
    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      vehicle
    });

    // Save to MongoDB
    await user.save();
    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// ==========================================
// 2. LOGIN AN EXISTING USER
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Email or Password' });
    }

    // Check if password matches the scrambled password in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Email or Password' });
    }

    // Generate the digital VIP Pass (JWT Token)
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' } // Token expires in 30 days
    );

    // Send the token and user info back to the frontend
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;