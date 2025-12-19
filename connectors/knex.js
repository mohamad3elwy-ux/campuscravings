const knex = require('knex');

// Use DATABASE_URL for Railway/production, fallback to local for development
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

const db = knex({
  client: 'pg',
  connection: connectionConfig
});

module.exports = db;
