const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'campus-cravings-secret-key';

// Verify JWT token
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Check if user is a Truck Owner
const isTruckOwner = (req, res, next) => {
  if (req.user.role !== 'truck_owner' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Truck Owner role required.' });
  }
  next();
};

// Check if user is a Customer
const isCustomer = (req, res, next) => {
  if (req.user.role !== 'customer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Customer role required.' });
  }
  next();
};

// Check if user is Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

module.exports = { auth, isTruckOwner, isCustomer, isAdmin, JWT_SECRET };
