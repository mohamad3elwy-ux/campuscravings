const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: 'postgresql://campuscravings_db_user:7F0IF2hfRDFfcyUZhFKreB6XR7xnWinE@dpg-d55t1sngi27c73dq1rt0-a.frankfurt-postgres.render.com/campuscravings_db',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected! Testing query...');
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0].now);
    await client.end();
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testConnection();
