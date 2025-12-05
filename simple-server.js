const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Serve the built React app
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// API Routes - Direct mock responses
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock user validation
  if (email === 'student@campus.edu' && password === 'password123') {
    const token = 'mock-jwt-token-' + Date.now();
    const user = {
      _id: 'user2',
      name: 'John Student',
      email: 'student@campus.edu',
      role: 'student',
      studentId: 'STU001'
    };
    res.json({ token, user });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token && token.startsWith('mock-jwt-token')) {
    res.json({
      user: {
        _id: 'user2',
        name: 'John Student',
        email: 'student@campus.edu',
        role: 'student',
        studentId: 'STU001'
      }
    });
  } else {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/api/trucks', (req, res) => {
  res.json([
    {
      _id: 'truck1',
      name: 'Main Campus Grill',
      location: 'North Gate',
      description: 'Classic burgers and grilled favorites',
      operatingHours: { open: '08:00', close: '20:00' },
      currentQueueTime: 15,
      rating: 4.8,
      ratingCount: 45,
      isActive: true
    },
    {
      _id: 'truck2',
      name: 'Taco Tuesday Express',
      location: 'Student Center Plaza',
      description: 'Authentic Mexican tacos and burritos',
      operatingHours: { open: '11:00', close: '18:00' },
      currentQueueTime: 12,
      rating: 4.6,
      ratingCount: 38,
      isActive: true
    }
  ]);
});

app.get('/api/menu', (req, res) => {
  const { truckId } = req.query;
  res.json([
    {
      _id: 'item1',
      name: 'Classic Cheeseburger',
      description: 'Juicy beef patty with lettuce and cheese',
      price: 8.99,
      category: 'main',
      foodTruck: truckId || 'truck1',
      preparationTime: 8,
      isAvailable: true
    },
    {
      _id: 'item2',
      name: 'French Fries',
      description: 'Golden crispy fries',
      price: 3.99,
      category: 'appetizer',
      foodTruck: truckId || 'truck1',
      preparationTime: 5,
      isAvailable: true
    }
  ]);
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Simple server running on http://localhost:${PORT}`);
});
