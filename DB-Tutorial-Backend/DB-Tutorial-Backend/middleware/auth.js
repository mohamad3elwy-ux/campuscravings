// ============================================
// AUTHENTICATION MIDDLEWARE - Campus Cravings
// ============================================
// Validates database connection and checks if required tables exist
// In production, this would also validate JWT tokens

const db = require('../connectors/db');

async function authMiddleware(req, res, next) {
  try {
    // Check if the campusCravings schema and User table exist
    let result = await db.raw(`SELECT EXISTS (
      SELECT * 
      FROM information_schema.tables 
      WHERE table_schema = 'campusCravings' 
      AND table_name = 'User'
    );`);
    
    let userTableExists = result.rows[0].exists;
    
    if (!userTableExists) {
      return res.status(503).json({
        error: "Database not initialized",
        message: "Please run scripts.sql to create the required tables",
        hint: "Execute the SQL in connectors/scripts.sql using pgAdmin4"
      });
    }

    // Check if Truck table exists
    let truckResult = await db.raw(`SELECT EXISTS (
      SELECT * 
      FROM information_schema.tables 
      WHERE table_schema = 'campusCravings' 
      AND table_name = 'Truck'
    );`);
    
    if (!truckResult.rows[0].exists) {
      return res.status(503).json({
        error: "Truck table not found",
        message: "Please run scripts.sql to create all required tables"
      });
    }

    // Check if Order table exists
    let orderResult = await db.raw(`SELECT EXISTS (
      SELECT * 
      FROM information_schema.tables 
      WHERE table_schema = 'campusCravings' 
      AND table_name = 'Order'
    );`);
    
    if (!orderResult.rows[0].exists) {
      return res.status(503).json({
        error: "Order table not found",
        message: "Please run scripts.sql to create all required tables"
      });
    }

    // All database checks passed, proceed to private routes
    next();
    
  } catch (error) {
    console.error("Database connection error:", error.message);
    return res.status(500).json({
      error: "Database connection failed",
      message: "Please check your PostgreSQL connection settings in connectors/db.js"
    });
  }
}

module.exports = { authMiddleware };