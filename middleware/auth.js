const db = require('../connectors/db');

// Authentication middleware - checks if user is logged in
const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      return res.redirect('/');
    }

    // Verify session exists in database
    const session = await db('FoodTruck.Sessions')
      .where('token', token)
      .andWhere('expiresAt', '>', new Date())
      .first();

    if (!session) {
      res.clearCookie('token');
      return res.redirect('/');
    }

    // Get user info
    const user = await db('FoodTruck.Users')
      .where('userId', session.userId)
      .first();

    if (!user) {
      res.clearCookie('token');
      return res.redirect('/');
    }

    // Attach user to request
    req.user = user;
    req.userId = user.userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.redirect('/');
  }
};

// Check if user is a truck owner
const isTruckOwner = async (req, res, next) => {
  if (req.user && req.user.role === 'truckOwner') {
    next();
  } else {
    return res.status(403).json({ error: 'Access denied. Truck owners only.' });
  }
};

// Check if user is a customer
const isCustomer = async (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    return res.status(403).json({ error: 'Access denied. Customers only.' });
  }
};

module.exports = {
  isAuthenticated,
  isTruckOwner,
  isCustomer
};
