const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Mock data
const users = [
  {
    _id: 'user2',
    name: 'John Student',
    email: 'student@campus.edu',
    password: 'password123',
    role: 'student',
    studentId: 'STU001'
  }
];

// API Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const token = 'mock-jwt-token-' + Date.now();
    const { password, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token && token.startsWith('mock-jwt-token')) {
    const user = users[0];
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
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

app.get('/api/orders', (req, res) => {
  res.json({ orders: [] });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
