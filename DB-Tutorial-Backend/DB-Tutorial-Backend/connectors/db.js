// ============================================
// DATABASE CONNECTION - Campus Cravings
// ============================================
// Using Knex.js as SQL query builder for PostgreSQL
// Knex provides a clean API for database operations

const knex = require('knex');

// Database Configuration
// IMPORTANT: Change password to match your PostgreSQL installation
const config = {
  client: 'pg',
  connection: {
    host : process.env.DB_HOST || 'localhost',
    port : process.env.DB_PORT || 5432,
    user : process.env.DB_USER || 'postgres',
    password : process.env.DB_PASSWORD || '123',
    database : process.env.DB_NAME || 'postgres'
  }
};

// Create database connection instance
const db = knex(config);

// Export for use in routes and middleware
module.exports = db;