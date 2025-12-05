const express = require('express');
const router = express.Router();
const db = require('../connectors/knex');
const { getUser } = require('../utils/session');

// ============================================
// TRUCK MANAGEMENT - 3 endpoints
// ============================================

// 8. GET /api/v1/trucks/view - View all available trucks (Customer)
router.get('/view', async (req, res) => {
  try {
    const result = await db.raw(`
      SELECT "truckId", "truckName", "truckLogo", "ownerId", "truckStatus", "orderStatus", "createdAt"
      FROM "FoodTruck"."Trucks"
      WHERE "truckStatus" = 'available' AND "orderStatus" = 'available'
      ORDER BY "truckId" ASC
    `);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 9. GET /api/v1/trucks/myTruck - View my truck info (Truck Owner)
router.get('/myTruck', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'truckOwner') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const result = await db.raw(`
      SELECT "truckId", "truckName", "truckLogo", "ownerId", "truckStatus", "orderStatus", "createdAt"
      FROM "FoodTruck"."Trucks"
      WHERE "truckId" = ${user.truckId}
    `);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Truck not found' });
    }
    
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 10. PUT /api/v1/trucks/updateOrderStatus - Update truck order availability (Truck Owner)
router.put('/updateOrderStatus', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'truckOwner') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { orderStatus } = req.body;
    
    await db.raw(`
      UPDATE "FoodTruck"."Trucks" SET "orderStatus" = '${orderStatus}' WHERE "truckId" = ${user.truckId}
    `);
    
    return res.status(200).json({ message: 'truck order status updated successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
