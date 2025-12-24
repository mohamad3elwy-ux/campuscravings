const db = require('../connectors/db');

/**
 * getUser - Retrieves the currently logged in user from session token
 */
async function getUser(req) {
  try {
    const token = req.headers['authorization'];
    
    if (!token) {
      return null;
    }
    
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace('Bearer ', '');
    
    // Get session
    const sessionResult = await db.raw(`
      SELECT * FROM "FoodTruck"."Sessions" WHERE "token" = '${cleanToken}'
    `);
    
    if (!sessionResult.rows || sessionResult.rows.length === 0) {
      return null;
    }
    
    const session = sessionResult.rows[0];
    
    // Get user with truckId
    const userResult = await db.raw(`
      SELECT u.*, t."truckId" FROM "FoodTruck"."Users" u
      LEFT JOIN "FoodTruck"."Trucks" t ON u."userId" = t."ownerId"
      WHERE u."userId" = ${session.userId}
    `);
    
    if (!userResult.rows || userResult.rows.length === 0) {
      return null;
    }
    
    return { ...session, ...userResult.rows[0] };
  } catch (error) {
    console.error('getUser error:', error.message);
    return null;
  }
}

module.exports = { getUser };
