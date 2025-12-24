const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://campuscravings_db_user:7F0IF2hfRDFfcyUZhFKreB6XR7xnWinE@dpg-d55t1sngi27c73dq1rt0-a.frankfurt-postgres.render.com/campuscravings_db',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  const result = await client.query('SELECT "userId", "name", "email", "password", "role" FROM "FoodTruck"."Users"');
  console.log('Users in database:');
  console.log(result.rows);
  await client.end();
}

check();
