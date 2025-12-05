const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Import routes
const menuItemRoutes = require('./routes/menuItem');
const trucksRoutes = require('./routes/trucks');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');

// Use routes
app.use('/api/v1/menuItem', menuItemRoutes);
app.use('/api/v1/trucks', trucksRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/order', orderRoutes);

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({ message: 'GIU Food Truck API - Milestone 3' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('===========================================');
  console.log('  GIU Food Truck Management System');
  console.log('  Milestone 3 Backend');
  console.log('===========================================');
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('===========================================');
});
