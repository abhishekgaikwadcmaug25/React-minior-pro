const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Admin
app.use('/api/admin', adminRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Temporary debug route - remove after testing
app.post('/api/debug/login', async (req, res) => {
  const { email, password } = req.body;
  const db = require('./config/database');
  const bcrypt = require('bcryptjs');
  
  console.log('Debug login attempt:', { email, password });
  
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.json({ error: 'Database error', details: err.message });
    }
    
    if (results.length === 0) {
      return res.json({ error: 'User not found' });
    }
    
    const user = results[0];
    console.log('User found:', { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      password_length: user.password?.length,
      password_prefix: user.password?.substring(0, 20) + '...'
    });
    
    // Test password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    // Test with a known good hash
    const testHash = await bcrypt.hash('admin123', 10);
    const testMatch = await bcrypt.compare('admin123', testHash);
    console.log('Test hash comparison:', testMatch);
    
    res.json({
      user_exists: true,
      user_role: user.role,
      password_match: isMatch,
      test_hash_works: testMatch,
      stored_password: user.password?.substring(0, 30) + '...'
    });
  });
});
module.exports = app;