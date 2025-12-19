// ============================================
// PRIVATE API ROUTES - GIU Food Truck System
// Milestone 3 - All 20 Endpoints Implementation
// ============================================

const db = require('../../connectors/db');
const { getUser } = require('../../utils/session');

function handlePrivateBackendApi(app) {

  // ============================================
  // MENU ITEM MANAGEMENT (Truck Owner) - 5 endpoints
  // ============================================

  // 1. POST /api/v1/menuItem/new - Create menu item
  app.post('/api/v1/menuItem/new', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'truckOwner') {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { name, description, price, category } = req.body;
      await db.raw(`
        INSERT INTO "FoodTruck"."MenuItems" ("truckId", "name", "description", "price", "category")
        VALUES (${user.truckId}, '${name}', '${description || ''}', ${price}, '${category}')
      `);
      return res.status(200).json({ message: "menu item was created successfully" });
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // 2. GET /api/v1/menuItem/view - View my menu items (Truck Owner)
  app.get('/api/v1/menuItem/view', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'truckOwner') {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const result = await db.raw(`
        SELECT "itemId", "truckId", "name", "description", "price", "category", "status", "createdAt"
        FROM "FoodTruck"."MenuItems"
        WHERE "truckId" = ${user.truckId} AND "status" = 'available'
        ORDER BY "itemId"
      `);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // 3. GET /api/v1/menuItem/view/:itemId - View specific menu item (Truck Owner)
  app.get('/api/v1/menuItem/view/:itemId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'truckOwner') {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const result = await db.raw(`
        SELECT "itemId", "truckId", "name", "description", "price", "category", "status", "createdAt"
        FROM "FoodTruck"."MenuItems"
        WHERE "itemId" = ${req.params.itemId} AND "truckId" = ${user.truckId}
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // 4. PUT /api/v1/menuItem/edit/:itemId - Edit menu item (Truck Owner)
  app.put('/api/v1/menuItem/edit/:itemId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'truckOwner') {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { name, description, price, category } = req.body;
      
      // Verify ownership
      const check = await db.raw(`
        SELECT * FROM "FoodTruck"."MenuItems" WHERE "itemId" = ${req.params.itemId} AND "truckId" = ${user.truckId}
      `);
      if (check.rows.length === 0) {
        return res.status(403).json({ error: "Not authorized to edit this item" });
      }
      
      await db.raw(`
        UPDATE "FoodTruck"."MenuItems"
        SET "name" = '${name}', "description" = '${description || ''}', "price" = ${price}, "category" = '${category}'
        WHERE "itemId" = ${req.params.itemId}
      `);
      return res.status(200).json({ message: "menu item updated successfully" });
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // 5. DELETE /api/v1/menuItem/delete/:itemId - Delete menu item (Truck Owner)
  app.delete('/api/v1/menuItem/delete/:itemId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'truckOwner') {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Verify ownership
      const check = await db.raw(`
        SELECT * FROM "FoodTruck"."MenuItems" WHERE "itemId" = ${req.params.itemId} AND "truckId" = ${user.truckId}
      `);
      if (check.rows.length === 0) {
        return res.status(403).json({ error: "Not authorized to delete this item" });
      }
      
      await db.raw(`
        UPDATE "FoodTruck"."MenuItems" SET "status" = 'unavailable' WHERE "itemId" = ${req.params.itemId}
      `);
      return res.status(200).json({ message: "menu item deleted successfully" });
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // ============================================
  // TRUCK MANAGEMENT - 2 endpoints (Truck Owner)
  // ============================================

  // 6. GET /api/v1/trucks/myTruck - View my truck info (Truck Owner)
  app.get('/api/v1/trucks/myTruck', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'truckOwner') {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const result = await db.raw(`
        SELECT "truckId", "truckName", "truckLogo", "ownerId", "truckStatus", "orderStatus", "createdAt"
        FROM "FoodTruck"."Trucks"
        WHERE "truckId" = ${user.truckId}
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Truck not found" });
      }
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // 7. PUT /api/v1/trucks/updateOrderStatus - Update truck order availability (Truck Owner)
  app.put('/api/v1/trucks/updateOrderStatus', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'truckOwner') {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { orderStatus } = req.body;
      await db.raw(`
        UPDATE "FoodTruck"."Trucks" SET "orderStatus" = '${orderStatus}' WHERE "truckId" = ${user.truckId}
      `);
      return res.status(200).json({ message: "truck order status updated successfully" });
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // ============================================
  // CART MANAGEMENT (Customer) - 4 endpoints
  // ============================================

  // 8. POST /api/v1/cart/new - Add item to cart (Customer)
  app.post('/api/v1/cart/new', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { itemId, quantity, price } = req.body;
      
      // Get the truckId of the new item
      const newItem = await db.raw(`
        SELECT "truckId" FROM "FoodTruck"."MenuItems" WHERE "itemId" = ${itemId}
      `);
      const newTruckId = newItem.rows[0].truckId;
      
      // Check existing cart items for different truck
      const existingCart = await db.raw(`
        SELECT c.*, m."truckId" FROM "FoodTruck"."Carts" c
        JOIN "FoodTruck"."MenuItems" m ON c."itemId" = m."itemId"
        WHERE c."userId" = ${user.userId}
      `);
      
      if (existingCart.rows.length > 0 && existingCart.rows[0].truckId !== newTruckId) {
        return res.status(400).json({ message: "Cannot order from multiple trucks" });
      }
      
      await db.raw(`
        INSERT INTO "FoodTruck"."Carts" ("userId", "itemId", "quantity", "price")
        VALUES (${user.userId}, ${itemId}, ${quantity}, ${price})
      `);
      
      return res.status(200).json({ message: "item added to cart successfully" });
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // 9. GET /api/v1/cart/view - View cart (Customer)
  app.get('/api/v1/cart/view', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const result = await db.raw(`
        SELECT c."cartId", c."userId", c."itemId", m."name" as "itemName", c."price", c."quantity"
        FROM "FoodTruck"."Carts" c
        JOIN "FoodTruck"."MenuItems" m ON c."itemId" = m."itemId"
        WHERE c."userId" = ${user.userId}
        ORDER BY c."cartId"
      `);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // 10. PUT /api/v1/cart/edit/:cartId - Update cart quantity (Customer)
  app.put('/api/v1/cart/edit/:cartId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Verify ownership
      const check = await db.raw(`
        SELECT * FROM "FoodTruck"."Carts" WHERE "cartId" = ${req.params.cartId} AND "userId" = ${user.userId}
      `);
      if (check.rows.length === 0) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const { quantity } = req.body;
      await db.raw(`
        UPDATE "FoodTruck"."Carts" SET "quantity" = ${quantity} WHERE "cartId" = ${req.params.cartId}
      `);
      return res.status(200).json({ message: "cart updated successfully" });
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // 11. DELETE /api/v1/cart/delete/:cartId - Remove from cart (Customer)
  app.delete('/api/v1/cart/delete/:cartId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Verify ownership
      const check = await db.raw(`
        SELECT * FROM "FoodTruck"."Carts" WHERE "cartId" = ${req.params.cartId} AND "userId" = ${user.userId}
      `);
      if (check.rows.length === 0) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      await db.raw(`DELETE FROM "FoodTruck"."Carts" WHERE "cartId" = ${req.params.cartId}`);
      return res.status(200).json({ message: "item removed from cart successfully" });
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // ============================================
  // ORDER MANAGEMENT - 6 endpoints
  // ============================================

  // 12. POST /api/v1/order/new - Place order (Customer)
  app.post('/api/v1/order/new', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { scheduledPickupTime } = req.body;
      
      // Get cart items with truck info
      const cartItems = await db.raw(`
        SELECT c.*, m."truckId", m."name" FROM "FoodTruck"."Carts" c
        JOIN "FoodTruck"."MenuItems" m ON c."itemId" = m."itemId"
        WHERE c."userId" = ${user.userId}
      `);
      
      if (cartItems.rows.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      
      // Check all items from same truck
      const truckIds = [...new Set(cartItems.rows.map(item => item.truckId))];
      if (truckIds.length > 1) {
        return res.status(400).json({ error: "Cannot order from multiple trucks" });
      }
      
      const truckId = truckIds[0];
      
      // Calculate total
      let totalPrice = 0;
      for (const item of cartItems.rows) {
        totalPrice += item.price * item.quantity;
      }
      
      // Create order
      const order = await db.raw(`
        INSERT INTO "FoodTruck"."Orders" ("userId", "truckId", "orderStatus", "totalPrice", "scheduledPickupTime", "estimatedEarliestPickup")
        VALUES (${user.userId}, ${truckId}, 'pending', ${totalPrice}, ${scheduledPickupTime ? `'${scheduledPickupTime}'` : 'NULL'}, ${scheduledPickupTime ? `'${scheduledPickupTime}'` : 'NULL'})
        RETURNING "orderId"
      `);
      
      const orderId = order.rows[0].orderId;
      
      // Insert order items
      for (const item of cartItems.rows) {
        await db.raw(`
          INSERT INTO "FoodTruck"."OrderItems" ("orderId", "itemId", "quantity", "price")
          VALUES (${orderId}, ${item.itemId}, ${item.quantity}, ${item.price})
        `);
      }
      
      // Clear cart
      await db.raw(`DELETE FROM "FoodTruck"."Carts" WHERE "userId" = ${user.userId}`);
      
      return res.status(200).json({ message: "order placed successfully" });
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // 13. GET /api/v1/order/myOrders - View my orders (Customer)
  app.get('/api/v1/order/myOrders', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
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
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // 14. GET /api/v1/order/details/:orderId - View order details (Customer)
  app.get('/api/v1/order/details/:orderId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Verify ownership
      const order = await db.raw(`
        SELECT o."orderId", t."truckName", o."orderStatus", o."totalPrice", 
               o."scheduledPickupTime", o."estimatedEarliestPickup", o."createdAt"
        FROM "FoodTruck"."Orders" o
        JOIN "FoodTruck"."Trucks" t ON o."truckId" = t."truckId"
        WHERE o."orderId" = ${req.params.orderId} AND o."userId" = ${user.userId}
      `);
      
      if (order.rows.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const items = await db.raw(`
        SELECT m."name" as "itemName", oi."quantity", oi."price"
        FROM "FoodTruck"."OrderItems" oi
        JOIN "FoodTruck"."MenuItems" m ON oi."itemId" = m."itemId"
        WHERE oi."orderId" = ${req.params.orderId}
      `);
      
      return res.status(200).json({ ...order.rows[0], items: items.rows });
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // 15. GET /api/v1/order/truckOrders - View truck's orders (Truck Owner)
  app.get('/api/v1/order/truckOrders', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'truckOwner') {
        return res.status(401).json({ error: "Unauthorized" });
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
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // 16. PUT /api/v1/order/updateStatus/:orderId - Update order status (Truck Owner)
  app.put('/api/v1/order/updateStatus/:orderId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'truckOwner') {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Verify order belongs to truck owner
      const check = await db.raw(`
        SELECT * FROM "FoodTruck"."Orders" WHERE "orderId" = ${req.params.orderId} AND "truckId" = ${user.truckId}
      `);
      if (check.rows.length === 0) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const { orderStatus, estimatedEarliestPickup } = req.body;
      
      let query = `UPDATE "FoodTruck"."Orders" SET "orderStatus" = '${orderStatus}'`;
      if (estimatedEarliestPickup) {
        query += `, "estimatedEarliestPickup" = '${estimatedEarliestPickup}'`;
      }
      query += ` WHERE "orderId" = ${req.params.orderId}`;
      
      await db.raw(query);
      return res.status(200).json({ message: "order status updated successfully" });
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // 17. GET /api/v1/order/truckOwner/:orderId - View order details (Truck Owner)
  app.get('/api/v1/order/truckOwner/:orderId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'truckOwner') {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Verify ownership
      const order = await db.raw(`
        SELECT o."orderId", t."truckName", o."orderStatus", o."totalPrice", 
               o."scheduledPickupTime", o."estimatedEarliestPickup", o."createdAt"
        FROM "FoodTruck"."Orders" o
        JOIN "FoodTruck"."Trucks" t ON o."truckId" = t."truckId"
        WHERE o."orderId" = ${req.params.orderId} AND o."truckId" = ${user.truckId}
      `);
      
      if (order.rows.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const items = await db.raw(`
        SELECT m."name" as "itemName", oi."quantity", oi."price"
        FROM "FoodTruck"."OrderItems" oi
        JOIN "FoodTruck"."MenuItems" m ON oi."itemId" = m."itemId"
        WHERE oi."orderId" = ${req.params.orderId}
      `);
      
      return res.status(200).json({ ...order.rows[0], items: items.rows });
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });
}

module.exports = { handlePrivateBackendApi };
