const db = require('../connectors/knex');

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
    
    const result = await db('FoodTruck.Sessions as s')
      .join('FoodTruck.Users as u', 's.userId', 'u.userId')
      .leftJoin('FoodTruck.Trucks as t', 'u.userId', 't.ownerId')
      .select(
        's.id',
        's.userId',
        's.token',
        's.expiresAt',
        'u.name',
        'u.birthDate',
        'u.email',
        'u.password',
        'u.role',
        't.truckId'
      )
      .where('s.token', cleanToken)
      .where('s.expiresAt', '>', new Date())
      .first();
    
    return result || null;
  } catch (error) {
    console.error('getUser error:', error.message);
    return null;
  }
}

module.exports = { getUser };
