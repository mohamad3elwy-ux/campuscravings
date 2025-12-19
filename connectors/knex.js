const knex = require('knex');

// Use DATABASE_URL for production, fallback to local for development
const connectionConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'postgres'
    };

// For Render connecting to Railway Postgres (public URL)
// DATABASE_URL=postgresql://postgres:pmmOsjWxooshuzUUTEZgcXqidqDwokjb@hopper.proxy.rlwy.net:42966/railway

const db = knex({
  client: 'pg',
  connection: connectionConfig
});

module.exports = db;
