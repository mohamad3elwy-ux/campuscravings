const express = require('express');
const crypto = require('crypto');
const db = require('../../connectors/db');

const router = express.Router();

router.post('/api/v1/user', async (req, res) => {
  try {
    const { name, email, password, role, birthDate } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    let userRole = 'customer';
    if (role === 'truckOwner' || role === 'customer') {
      userRole = role;
    }

    const existing = await db.raw(`
      SELECT "userId" FROM "FoodTruck"."Users" WHERE "email" = '${email}'
    `);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    let columns = '"name", "email", "password", "role"';
    let values = `'${name}', '${email}', '${password}', '${userRole}'`;
    if (birthDate) {
      columns += ', "birthDate"';
      values += `, '${birthDate}'`;
    }

    const result = await db.raw(`
      INSERT INTO "FoodTruck"."Users" (${columns})
      VALUES (${values})
      RETURNING "userId", "name", "email", "role", "birthDate"
    `);

    const user = result.rows[0];
    return res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (err) {
    console.log('Error:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

router.post('/api/v1/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await db.raw(`
      SELECT u."userId", u."name", u."email", u."password", u."role", t."truckId"
      FROM "FoodTruck"."Users" u
      LEFT JOIN "FoodTruck"."Trucks" t ON u."userId" = t."ownerId"
      WHERE u."email" = '${email}'
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = 'token-' + crypto.randomBytes(16).toString('hex');

    await db.raw(`
      INSERT INTO "FoodTruck"."Sessions" ("userId", "token", "expiresAt")
      VALUES (${user.userId}, '${token}', NOW() + INTERVAL '24 hours')
    `);

    // Set cookie for authentication
    res.cookie('token', token, { httpOnly: false, maxAge: 24 * 60 * 60 * 1000 });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        truckId: user.truckId || null
      }
    });
  } catch (err) {
    console.log('Error:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
