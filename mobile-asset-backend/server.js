const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Import the auth routes (login, signup)

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

// Use the authRoutes for '/api/auth' path
app.use('/api/auth', authRoutes); // Make sure this is after you initialize the app

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err));

// Example route for root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Mobile Asset Valuation API!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));