const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// View engine configuration (Milestone 4)
app.set('view engine', 'hjs');
app.set('views', path.join(__dirname, 'views'));

// Static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Import API routes (Milestone 3 backend)
const menuItemRoutes = require('./routes/menuItem');
const trucksRoutes = require('./routes/trucks');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');

// Import public view & auth API routes (Milestone 4 frontend)
let publicViewRoutes;
let publicApiRoutes;
try {
  publicViewRoutes = require('./routes/public/view');
  publicApiRoutes = require('./routes/public/api');
} catch (err) {
  // If Milestone 4 routes are not created yet, ignore to keep backend working
  publicViewRoutes = null;
  publicApiRoutes = null;
}

// Use API routes
app.use('/api/v1/menuItem', menuItemRoutes);
app.use('/api/v1/trucks', trucksRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/order', orderRoutes);

// Use public routes when available
if (publicViewRoutes) {
  app.use('/', publicViewRoutes);
}
if (publicApiRoutes) {
  app.use('/', publicApiRoutes);
}

// Welcome endpoint (fallback JSON)
app.get('/', (req, res) => {
  // If Milestone 4 login view is not set up yet, show JSON message
  if (!publicViewRoutes) {
    return res.json({ message: 'GIU Food Truck API - Milestone 3' });
  }
  return res.render('login');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('===========================================');
  console.log('  GIU Food Truck Management System');
  console.log('  Milestone 3 Backend + Milestone 4 Frontend');
  console.log('===========================================');
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('===========================================');
});
