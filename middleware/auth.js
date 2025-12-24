const db = require('../connectors/db');

// Authentication middleware - checks if user is logged in
const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      return res.redirect('/');
    }

    // Verify session exists in database
    const sessionResult = await db.raw(`
      SELECT * FROM "FoodTruck"."Sessions" 
      WHERE "token" = '${token}' AND "expiresAt" > NOW()
    `);

    if (!sessionResult.rows || sessionResult.rows.length === 0) {
      res.clearCookie('token');
      return res.redirect('/');
    }

    const session = sessionResult.rows[0];

    // Get user info
    const userResult = await db.raw(`
      SELECT u.*, t."truckId" FROM "FoodTruck"."Users" u
      LEFT JOIN "FoodTruck"."Trucks" t ON u."userId" = t."ownerId"
      WHERE u."userId" = ${session.userId}
    `);

    if (!userResult.rows || userResult.rows.length === 0) {
      res.clearCookie('token');
      return res.redirect('/');
    }

    // Attach user to request
    req.user = userResult.rows[0];
    req.userId = userResult.rows[0].userId;
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
