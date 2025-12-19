const express = require('express');
const router = express.Router();
const db = require('../connectors/knex');
const { getUser } = require('../utils/session');

// ============================================
// MENU ITEM MANAGEMENT (Truck Owner) - 5 endpoints
// ============================================

// 1. POST /api/v1/menuItem/new - Create menu item
router.post('/new', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'truckOwner') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { name, price, description, category } = req.body;
    
    await db.raw(`
      INSERT INTO "FoodTruck"."MenuItems" ("truckId", "name", "price", "description", "category")
      VALUES (${user.truckId}, '${name}', ${price}, '${description || ''}', '${category}')
    `);
    
    return res.status(200).json({ message: 'menu item was created successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/v1/menuItem/view - View my menu items (Truck Owner)
router.get('/view', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'truckOwner') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const result = await db.raw(`
      SELECT "itemId", "truckId", "name", "description", "price", "category", "status", "createdAt"
      FROM "FoodTruck"."MenuItems"
      WHERE "truckId" = ${user.truckId} AND "status" = 'available'
      ORDER BY "itemId" ASC
    `);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 3. GET /api/v1/menuItem/view/:itemId - View specific menu item (Truck Owner)
router.get('/view/:itemId', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'truckOwner') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { itemId } = req.params;
    
    const result = await db.raw(`
      SELECT "itemId", "truckId", "name", "description", "price", "category", "status", "createdAt"
      FROM "FoodTruck"."MenuItems"
      WHERE "itemId" = ${itemId} AND "truckId" = ${user.truckId}
    `);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 4. PUT /api/v1/menuItem/edit/:itemId - Edit menu item (Truck Owner)
router.put('/edit/:itemId', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'truckOwner') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { itemId } = req.params;
    const { name, price, category, description } = req.body;
    
    // Verify ownership
    const existing = await db.raw(`
      SELECT * FROM "FoodTruck"."MenuItems" WHERE "itemId" = ${itemId} AND "truckId" = ${user.truckId}
    `);
    
    if (existing.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to edit this item' });
    }
    
    await db.raw(`
      UPDATE "FoodTruck"."MenuItems"
      SET "name" = '${name}', "price" = ${price}, "category" = '${category}', "description" = '${description || ''}'
      WHERE "itemId" = ${itemId}
    `);
    
    return res.status(200).json({ message: 'menu item updated successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 5. DELETE /api/v1/menuItem/delete/:itemId - Delete menu item (Truck Owner)
router.delete('/delete/:itemId', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'truckOwner') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { itemId } = req.params;
    
    // Verify ownership
    const existing = await db.raw(`
      SELECT * FROM "FoodTruck"."MenuItems" WHERE "itemId" = ${itemId} AND "truckId" = ${user.truckId}
    `);
    
    if (existing.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }
    
    // Soft delete - set status to unavailable
    await db.raw(`
      UPDATE "FoodTruck"."MenuItems" SET "status" = 'unavailable' WHERE "itemId" = ${itemId}
    `);
    
    return res.status(200).json({ message: 'menu item deleted successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// ============================================
// BROWSE MENU (Customer) - 2 endpoints
// ============================================

// 6. GET /api/v1/menuItem/truck/:truckId - View truck's menu (Customer)
router.get('/truck/:truckId', async (req, res) => {
  try {
    const { truckId } = req.params;
    
    const result = await db.raw(`
      SELECT "itemId", "truckId", "name", "description", "price", "category", "status", "createdAt"
      FROM "FoodTruck"."MenuItems"
      WHERE "truckId" = ${truckId} AND "status" = 'available'
      ORDER BY "itemId" ASC
    `);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 7. GET /api/v1/menuItem/truck/:truckId/category/:category - Search by category (Customer)
router.get('/truck/:truckId/category/:category', async (req, res) => {
  try {
    const { truckId, category } = req.params;
    
    const result = await db.raw(`
      SELECT "itemId", "truckId", "name", "description", "price", "category", "status", "createdAt"
      FROM "FoodTruck"."MenuItems"
      WHERE "truckId" = ${truckId} AND "category" = '${category}' AND "status" = 'available'
      ORDER BY "itemId" ASC
    `);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
