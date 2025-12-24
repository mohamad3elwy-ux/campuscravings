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

// Render PostgreSQL URL
// DATABASE_URL=postgresql://campuscravings_db_user:7F0IF2hfRDFfcyUZhFKreB6XR7xnWinE@dpg-d55t1sngi27c73dq1rt0-a.frankfurt-postgres.render.com/campuscravings_db

const db = knex({
  client: 'pg',
  connection: connectionConfig
});

module.exports = db;
