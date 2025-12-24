const express = require('express');
const router = express.Router();
const db = require('../connectors/db');
const { getUser } = require('../utils/session');

// ============================================
// CART MANAGEMENT (Customer) - 4 endpoints
// ============================================

// 11. POST /api/v1/cart/new - Add item to cart (Customer)
router.post('/new', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { itemId, quantity, price } = req.body;
    
    // Get the truckId of the new item
    const newItemResult = await db.raw(`
      SELECT "truckId" FROM "FoodTruck"."MenuItems" WHERE "itemId" = ${itemId}
    `);
    
    if (newItemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    const newItem = newItemResult.rows[0];
    
    // Check existing cart items for different truck
    const existingCartResult = await db.raw(`
      SELECT m."truckId"
      FROM "FoodTruck"."Carts" c
      JOIN "FoodTruck"."MenuItems" m ON c."itemId" = m."itemId"
      WHERE c."userId" = ${user.userId}
      LIMIT 1
    `);
    
    if (existingCartResult.rows.length > 0 && existingCartResult.rows[0].truckId !== newItem.truckId) {
      return res.status(400).json({ message: 'Cannot order from multiple trucks' });
    }
    
    await db.raw(`
      INSERT INTO "FoodTruck"."Carts" ("userId", "itemId", "quantity", "price")
      VALUES (${user.userId}, ${itemId}, ${quantity}, ${price})
    `);
    
    return res.status(200).json({ message: 'item added to cart successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 12. GET /api/v1/cart/view - View cart (Customer)
router.get('/view', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = await db.raw(`
      SELECT c."cartId", c."userId", c."itemId", m."name" as "itemName", c."price", c."quantity"
      FROM "FoodTruck"."Carts" c
      JOIN "FoodTruck"."MenuItems" m ON c."itemId" = m."itemId"
      WHERE c."userId" = ${user.userId}
      ORDER BY c."cartId" ASC
    `);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 13. PUT /api/v1/cart/edit/:cartId - Update cart quantity (Customer)
router.put('/edit/:cartId', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { cartId } = req.params;
    const { quantity } = req.body;
    
    // Verify ownership
    const existing = await db.raw(`
      SELECT * FROM "FoodTruck"."Carts" WHERE "cartId" = ${cartId} AND "userId" = ${user.userId}
    `);
    
    if (existing.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await db.raw(`
      UPDATE "FoodTruck"."Carts" SET "quantity" = ${quantity} WHERE "cartId" = ${cartId}
    `);
    
    return res.status(200).json({ message: 'cart updated successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 14. DELETE /api/v1/cart/delete/:cartId - Remove from cart (Customer)
router.delete('/delete/:cartId', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { cartId } = req.params;
    
    // Verify ownership
    const existing = await db.raw(`
      SELECT * FROM "FoodTruck"."Carts" WHERE "cartId" = ${cartId} AND "userId" = ${user.userId}
    `);
    
    if (existing.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await db.raw(`
      DELETE FROM "FoodTruck"."Carts" WHERE "cartId" = ${cartId}
    `);
    
    return res.status(200).json({ message: 'item removed from cart successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
