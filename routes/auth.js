const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // User model

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    // Use matchPassword method for comparison
    const isMatch = await user.matchPassword(password);

    console.log('Provided password:', password);
    console.log('Stored hashed password:', user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token, name:user.name,email:user.email, });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Signup route (You can define similar functionality here)
router.post('/signup', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    // Validate input fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create and save a new user (password hashing handled by the pre('save') hook)
  const newUser = new User({ name, email, password });
  await newUser.save();

  // Generate a token
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(201).json({ message: 'User registered successfully', token , name:newUser.name,emai:newUser.email  });
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
}
});

module.exports = router;
