// server.js

const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();

// Route Imports
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ======= MIDDLEWARE =======
app.use(cors({
  origin: '*', // Or set your frontend URL: e.g. 'http://localhost:3000'
  credentials: true
}));
app.use(express.json());

// ======= API ROUTES =======
app.use('/api/auth', authRoutes);      // 🔐 Auth: register/login
app.use('/api/orders', orderRoutes);   // 🍕 Customer: place orders, track
app.use('/api/admin', adminRoutes);    // 🧑‍🍳 Owner: manage dashboard

// ======= HEALTH CHECK =======
app.get('/', (req, res) => {
  db.query('SELECT 1', (err) => {
    if (err) return res.status(500).send('❌ Database connection failed');
    res.send('✅ Database connected successfully');
  });
});

// ======= START SERVER =======
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
