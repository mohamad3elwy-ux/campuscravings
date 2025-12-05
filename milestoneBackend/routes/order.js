const express = require('express');
const router = express.Router();
const db = require('../connectors/knex');
const { getUser } = require('../utils/session');

// ============================================
// ORDER MANAGEMENT - 6 endpoints
// ============================================

// 15. POST /api/v1/order/new - Place order (Customer)
router.post('/new', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { scheduledPickupTime } = req.body;
    
    // Get cart items with truck info
    const cartResult = await db.raw(`
      SELECT c.*, m."truckId", m."name"
      FROM "FoodTruck"."Carts" c
      JOIN "FoodTruck"."MenuItems" m ON c."itemId" = m."itemId"
      WHERE c."userId" = ${user.userId}
    `);
    
    const cartItems = cartResult.rows;
    
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Check all items from same truck
    const truckIds = [...new Set(cartItems.map(item => item.truckId))];
    if (truckIds.length > 1) {
      return res.status(400).json({ error: 'Cannot order from multiple trucks' });
    }
    
    const truckId = truckIds[0];
    
    // Calculate total price
    let totalPrice = 0;
    for (const item of cartItems) {
      totalPrice += parseFloat(item.price) * item.quantity;
    }
    
    // Create order
    const pickupTime = scheduledPickupTime ? `'${scheduledPickupTime}'` : 'NULL';
    const orderResult = await db.raw(`
      INSERT INTO "FoodTruck"."Orders" ("userId", "truckId", "orderStatus", "totalPrice", "scheduledPickupTime", "estimatedEarliestPickup")
      VALUES (${user.userId}, ${truckId}, 'pending', ${totalPrice}, ${pickupTime}, ${pickupTime})
      RETURNING "orderId"
    `);
    
    const orderId = orderResult.rows[0].orderId;
    
    // Insert order items
    for (const item of cartItems) {
      await db.raw(`
        INSERT INTO "FoodTruck"."OrderItems" ("orderId", "itemId", "quantity", "price")
        VALUES (${orderId}, ${item.itemId}, ${item.quantity}, ${item.price})
      `);
    }
    
    // Clear cart
    await db.raw(`DELETE FROM "FoodTruck"."Carts" WHERE "userId" = ${user.userId}`);
    
    return res.status(200).json({ message: 'order placed successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 16. GET /api/v1/order/myOrders - View my orders (Customer)
router.get('/myOrders', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = await db.raw(`
      SELECT o."orderId", o."userId", o."truckId", t."truckName", o."orderStatus", 
             o."totalPrice", o."scheduledPickupTime", o."estimatedEarliestPickup", o."createdAt"
      FROM "FoodTruck"."Orders" o
      JOIN "FoodTruck"."Trucks" t ON o."truckId" = t."truckId"
      WHERE o."userId" = ${user.userId}
      ORDER BY o."orderId" DESC
    `);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 17. GET /api/v1/order/details/:orderId - View order details (Customer)
router.get('/details/:orderId', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { orderId } = req.params;
    
    // Get order (verify ownership)
    const orderResult = await db.raw(`
      SELECT o."orderId", t."truckName", o."orderStatus", o."totalPrice", 
             o."scheduledPickupTime", o."estimatedEarliestPickup", o."createdAt"
      FROM "FoodTruck"."Orders" o
      JOIN "FoodTruck"."Trucks" t ON o."truckId" = t."truckId"
      WHERE o."orderId" = ${orderId} AND o."userId" = ${user.userId}
    `);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    // Get order items
    const itemsResult = await db.raw(`
      SELECT m."name" as "itemName", oi."quantity", oi."price"
      FROM "FoodTruck"."OrderItems" oi
      JOIN "FoodTruck"."MenuItems" m ON oi."itemId" = m."itemId"
      WHERE oi."orderId" = ${orderId}
    `);
    
    return res.status(200).json({ ...order, items: itemsResult.rows });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 18. GET /api/v1/order/truckOrders - View truck's orders (Truck Owner)
router.get('/truckOrders', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'truckOwner') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const result = await db.raw(`
      SELECT o."orderId", o."userId", u."name" as "customerName", o."orderStatus", 
             o."totalPrice", o."scheduledPickupTime", o."estimatedEarliestPickup", o."createdAt"
      FROM "FoodTruck"."Orders" o
      JOIN "FoodTruck"."Users" u ON o."userId" = u."userId"
      WHERE o."truckId" = ${user.truckId}
      ORDER BY o."orderId" DESC
    `);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 19. GET /api/v1/order/truckOwner/:orderId - View order details (Truck Owner)
router.get('/truckOwner/:orderId', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'truckOwner') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { orderId } = req.params;
    
    // Get order (verify ownership)
    const orderResult = await db.raw(`
      SELECT o."orderId", t."truckName", o."orderStatus", o."totalPrice", 
             o."scheduledPickupTime", o."estimatedEarliestPickup", o."createdAt"
      FROM "FoodTruck"."Orders" o
      JOIN "FoodTruck"."Trucks" t ON o."truckId" = t."truckId"
      WHERE o."orderId" = ${orderId} AND o."truckId" = ${user.truckId}
    `);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    // Get order items
    const itemsResult = await db.raw(`
      SELECT m."name" as "itemName", oi."quantity", oi."price"
      FROM "FoodTruck"."OrderItems" oi
      JOIN "FoodTruck"."MenuItems" m ON oi."itemId" = m."itemId"
      WHERE oi."orderId" = ${orderId}
    `);
    
    return res.status(200).json({ ...order, items: itemsResult.rows });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 20. PUT /api/v1/order/updateStatus/:orderId - Update order status (Truck Owner)
router.put('/updateStatus/:orderId', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'truckOwner') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { orderId } = req.params;
    const { orderStatus, estimatedEarliestPickup } = req.body;
    
    // Verify order belongs to truck owner
    const existing = await db.raw(`
      SELECT * FROM "FoodTruck"."Orders" WHERE "orderId" = ${orderId} AND "truckId" = ${user.truckId}
    `);
    
    if (existing.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    let updateQuery = `UPDATE "FoodTruck"."Orders" SET "orderStatus" = '${orderStatus}'`;
    if (estimatedEarliestPickup) {
      updateQuery += `, "estimatedEarliestPickup" = '${estimatedEarliestPickup}'`;
    }
    updateQuery += ` WHERE "orderId" = ${orderId}`;
    
    await db.raw(updateQuery);
    
    return res.status(200).json({ message: 'order status updated successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
