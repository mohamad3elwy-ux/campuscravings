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
    const trucks = await db('FoodTruck.Trucks')
      .select('truckId', 'truckName', 'truckLogo', 'ownerId', 'truckStatus', 'orderStatus', 'createdAt')
      .where('truckStatus', 'available')
      .where('orderStatus', 'available')
      .orderBy('truckId', 'asc');
    
    return res.status(200).json(trucks);
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
    
    const truck = await db('FoodTruck.Trucks')
      .select('truckId', 'truckName', 'truckLogo', 'ownerId', 'truckStatus', 'orderStatus', 'createdAt')
      .where('truckId', user.truckId)
      .first();
    
    if (!truck) {
      return res.status(404).json({ error: 'Truck not found' });
    }
    
    return res.status(200).json(truck);
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
    
    await db('FoodTruck.Trucks')
      .where('truckId', user.truckId)
      .update({ orderStatus: orderStatus });
    
    return res.status(200).json({ message: 'truck order status updated successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
