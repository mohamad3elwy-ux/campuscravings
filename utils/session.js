const db = require('../connectors/db');

/**
 * getUser - Retrieves the currently logged in user from session token
 * 
 * Returns user object with:
 * - id: session id
 * - userId: user id
 * - token: session token
 * - expiresAt: session expiry date
 * - name: user name
 * - birthDate: user birth date
 * - email: user email
 * - password: user password (hashed)
 * - role: 'customer' or 'truckOwner'
 * - truckId: truck id (if truckOwner)
 */
async function getUser(req) {
  try {
    const token = req.headers['authorization'];
    
    if (!token) {
      return null;
    }
    
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace('Bearer ', '');
    
    const result = await db.raw(`
      SELECT 
        s."id",
        s."userId",
        s."token",
        s."expiresAt",
        u."name",
        u."birthDate",
        u."email",
        u."password",
        u."role",
        t."truckId"
      FROM "FoodTruck"."Sessions" s
      JOIN "FoodTruck"."Users" u ON s."userId" = u."userId"
      LEFT JOIN "FoodTruck"."Trucks" t ON u."userId" = t."ownerId"
      WHERE s."token" = '${cleanToken}'
      AND s."expiresAt" > NOW()
      LIMIT 1
    `);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('getUser error:', error.message);
    return null;
  }
}

module.exports = { getUser };
