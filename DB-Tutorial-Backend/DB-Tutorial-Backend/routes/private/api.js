// ============================================
// PRIVATE API ROUTES - Campus Cravings
// ============================================
// These routes require authentication
// - Menu management, Truck management, Cart, Orders

const db = require('../../connectors/db');

function handlePrivateBackendApi(app) {

  // ============================================
  // MENU ITEM MANAGEMENT (Truck Owner)
  // ============================================

  // POST /api/v1/menuItem/new - Create menu item
  app.post('/api/v1/menuItem/new', async (req, res) => {
    try {
      const { name, description, price, category, truckId, ingredients, allergens, preparationTime } = req.body;
      const result = await db.raw(`
        INSERT INTO "campusCravings"."MenuItem" 
        (name, description, price, category, truckid, ingredients, allergens, preparationtime)
        VALUES ('${name}', '${description}', ${price}, '${category || 'Main'}', ${truckId}, 
                '${ingredients || ''}', '${allergens || ''}', ${preparationTime || 15})
        RETURNING *
      `);
      return res.status(201).json({ message: "Menu item created", menuItem: result.rows[0] });
    } catch (err) {
      console.log("Error creating menu item:", err.message);
      return res.status(400).json({ error: "Failed to create menu item" });
    }
  });

  // GET /api/v1/menuItem/view - View my menu items (Truck Owner)
  app.get('/api/v1/menuItem/view', async (req, res) => {
    try {
      const { ownerId } = req.query;
      const result = await db.raw(`
        SELECT m.*, t.name as truckName 
        FROM "campusCravings"."MenuItem" m
        JOIN "campusCravings"."Truck" t ON m.truckid = t.id
        WHERE t.ownerid = ${ownerId}
        ORDER BY t.name, m.category, m.name
      `);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log("Error fetching menu items:", err.message);
      return res.status(400).json({ error: "Failed to fetch menu items" });
    }
  });

  // GET /api/v1/menuItem/view/:itemId - View specific menu item
  app.get('/api/v1/menuItem/view/:itemId', async (req, res) => {
    try {
      const result = await db.raw(`
        SELECT m.*, t.name as truckName, t.ownerid
        FROM "campusCravings"."MenuItem" m
        JOIN "campusCravings"."Truck" t ON m.truckid = t.id
        WHERE m.id = ${req.params.itemId}
      `);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.log("Error fetching menu item:", err.message);
      return res.status(400).json({ error: "Failed to fetch menu item" });
    }
  });

  // PUT /api/v1/menuItem/edit/:itemId - Edit menu item
  app.put('/api/v1/menuItem/edit/:itemId', async (req, res) => {
    try {
      const { name, description, price, category, ingredients, allergens, preparationTime, isAvailable } = req.body;
      const result = await db.raw(`
        UPDATE "campusCravings"."MenuItem"
        SET name = '${name}', description = '${description}', price = ${price},
            category = '${category}', ingredients = '${ingredients || ''}',
            allergens = '${allergens || ''}', preparationtime = ${preparationTime || 15},
            isavailable = ${isAvailable !== false}
        WHERE id = ${req.params.itemId}
        RETURNING *
      `);
      return res.status(200).json({ message: "Menu item updated", menuItem: result.rows[0] });
    } catch (err) {
      console.log("Error updating menu item:", err.message);
      return res.status(400).json({ error: "Failed to update menu item" });
    }
  });

  // DELETE /api/v1/menuItem/delete/:itemId - Delete menu item
  app.delete('/api/v1/menuItem/delete/:itemId', async (req, res) => {
    try {
      await db.raw(`DELETE FROM "campusCravings"."MenuItem" WHERE id = ${req.params.itemId}`);
      return res.status(200).json({ message: "Menu item deleted" });
    } catch (err) {
      console.log("Error deleting menu item:", err.message);
      return res.status(400).json({ error: "Failed to delete menu item" });
    }
  });

  // ============================================
  // TRUCK MANAGEMENT (Truck Owner)
  // ============================================

  // GET /api/v1/trucks/myTruck - View my truck info
  app.get('/api/v1/trucks/myTruck', async (req, res) => {
    try {
      const { ownerId } = req.query;
      const result = await db.raw(`
        SELECT * FROM "campusCravings"."Truck" WHERE ownerid = ${ownerId}
      `);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log("Error fetching my trucks:", err.message);
      return res.status(400).json({ error: "Failed to fetch trucks" });
    }
  });

  // POST /api/v1/trucks/new - Create new truck
  app.post('/api/v1/trucks/new', async (req, res) => {
    try {
      const { name, description, location, ownerId, openTime, closeTime } = req.body;
      const result = await db.raw(`
        INSERT INTO "campusCravings"."Truck" 
        (name, description, location, ownerid, opentime, closetime, isactive, isapproved)
        VALUES ('${name}', '${description}', '${location}', ${ownerId}, 
                '${openTime || '08:00'}', '${closeTime || '20:00'}', true, false)
        RETURNING *
      `);
      return res.status(201).json({ message: "Truck created, pending approval", truck: result.rows[0] });
    } catch (err) {
      console.log("Error creating truck:", err.message);
      return res.status(400).json({ error: "Failed to create truck" });
    }
  });

  // PUT /api/v1/trucks/updateOrderStatus - Update truck availability
  app.put('/api/v1/trucks/updateOrderStatus', async (req, res) => {
    try {
      const { truckId, isActive } = req.body;
      const result = await db.raw(`
        UPDATE "campusCravings"."Truck" SET isactive = ${isActive} WHERE id = ${truckId}
        RETURNING *
      `);
      return res.status(200).json({ message: "Truck availability updated", truck: result.rows[0] });
    } catch (err) {
      console.log("Error updating truck:", err.message);
      return res.status(400).json({ error: "Failed to update truck" });
    }
  });

  // ============================================
  // CART MANAGEMENT (Customer)
  // ============================================

  // POST /api/v1/cart/new - Add item to cart
  app.post('/api/v1/cart/new', async (req, res) => {
    try {
      const { userId, truckId, menuItemId, quantity, specialInstructions } = req.body;
      
      // Find or create cart
      let cart = await db.raw(`
        SELECT * FROM "campusCravings"."Cart" WHERE userid = ${userId} AND truckid = ${truckId}
      `);
      
      let cartId;
      if (cart.rows.length === 0) {
        const newCart = await db.raw(`
          INSERT INTO "campusCravings"."Cart" (userid, truckid) VALUES (${userId}, ${truckId})
          RETURNING id
        `);
        cartId = newCart.rows[0].id;
      } else {
        cartId = cart.rows[0].id;
      }
      
      // Add item to cart
      await db.raw(`
        INSERT INTO "campusCravings"."CartItem" (cartid, menuitemid, quantity, specialinstructions)
        VALUES (${cartId}, ${menuItemId}, ${quantity || 1}, '${specialInstructions || ''}')
      `);
      
      return res.status(200).json({ message: "Item added to cart", cartId });
    } catch (err) {
      console.log("Error adding to cart:", err.message);
      return res.status(400).json({ error: "Failed to add item to cart" });
    }
  });

  // GET /api/v1/cart/view - View cart
  app.get('/api/v1/cart/view', async (req, res) => {
    try {
      const { userId } = req.query;
      const result = await db.raw(`
        SELECT c.id as cartId, t.name as truckName, ci.*, m.name, m.price
        FROM "campusCravings"."Cart" c
        JOIN "campusCravings"."Truck" t ON c.truckid = t.id
        JOIN "campusCravings"."CartItem" ci ON c.id = ci.cartid
        JOIN "campusCravings"."MenuItem" m ON ci.menuitemid = m.id
        WHERE c.userid = ${userId}
      `);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log("Error fetching cart:", err.message);
      return res.status(400).json({ error: "Failed to fetch cart" });
    }
  });

  // PUT /api/v1/cart/edit/:cartId - Update cart quantity
  app.put('/api/v1/cart/edit/:cartId', async (req, res) => {
    try {
      const { menuItemId, quantity } = req.body;
      if (quantity <= 0) {
        await db.raw(`
          DELETE FROM "campusCravings"."CartItem" 
          WHERE cartid = ${req.params.cartId} AND menuitemid = ${menuItemId}
        `);
      } else {
        await db.raw(`
          UPDATE "campusCravings"."CartItem" SET quantity = ${quantity}
          WHERE cartid = ${req.params.cartId} AND menuitemid = ${menuItemId}
        `);
      }
      return res.status(200).json({ message: "Cart updated" });
    } catch (err) {
      console.log("Error updating cart:", err.message);
      return res.status(400).json({ error: "Failed to update cart" });
    }
  });

  // DELETE /api/v1/cart/delete/:cartId - Remove from cart
  app.delete('/api/v1/cart/delete/:cartId', async (req, res) => {
    try {
      await db.raw(`DELETE FROM "campusCravings"."CartItem" WHERE cartid = ${req.params.cartId}`);
      await db.raw(`DELETE FROM "campusCravings"."Cart" WHERE id = ${req.params.cartId}`);
      return res.status(200).json({ message: "Cart deleted" });
    } catch (err) {
      console.log("Error deleting cart:", err.message);
      return res.status(400).json({ error: "Failed to delete cart" });
    }
  });

  // ============================================
  // ORDER MANAGEMENT
  // ============================================

  // POST /api/v1/order/new - Place order (Customer)
  app.post('/api/v1/order/new', async (req, res) => {
    try {
      const { userId, truckId, items, totalAmount, pickupStartTime, pickupEndTime, customerName, customerEmail } = req.body;
      const orderNumber = 'ORD-' + Date.now();
      
      const order = await db.raw(`
        INSERT INTO "campusCravings"."Order" 
        (ordernumber, userid, truckid, totalamount, status, pickupstarttime, pickupendtime, customername, customeremail)
        VALUES ('${orderNumber}', ${userId}, ${truckId}, ${totalAmount}, 'pending', 
                ${pickupStartTime ? `'${pickupStartTime}'` : 'NULL'}, 
                ${pickupEndTime ? `'${pickupEndTime}'` : 'NULL'},
                '${customerName}', '${customerEmail}')
        RETURNING *
      `);
      
      const orderId = order.rows[0].id;
      
      // Add order items
      for (const item of items) {
        await db.raw(`
          INSERT INTO "campusCravings"."OrderItem" (orderid, menuitemid, name, quantity, price, specialinstructions)
          VALUES (${orderId}, ${item.menuItemId}, '${item.name}', ${item.quantity}, ${item.price}, '${item.specialInstructions || ''}')
        `);
      }
      
      return res.status(201).json({ message: "Order placed successfully", order: order.rows[0] });
    } catch (err) {
      console.log("Error placing order:", err.message);
      return res.status(400).json({ error: "Failed to place order" });
    }
  });

  // GET /api/v1/order/myOrders - View my orders (Customer)
  app.get('/api/v1/order/myOrders', async (req, res) => {
    try {
      const { userId } = req.query;
      const result = await db.raw(`
        SELECT o.*, t.name as truckName
        FROM "campusCravings"."Order" o
        JOIN "campusCravings"."Truck" t ON o.truckid = t.id
        WHERE o.userid = ${userId}
        ORDER BY o.createdat DESC
      `);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log("Error fetching orders:", err.message);
      return res.status(400).json({ error: "Failed to fetch orders" });
    }
  });

  // GET /api/v1/order/details/:orderId - View order details (Customer)
  app.get('/api/v1/order/details/:orderId', async (req, res) => {
    try {
      const order = await db.raw(`
        SELECT o.*, t.name as truckName
        FROM "campusCravings"."Order" o
        JOIN "campusCravings"."Truck" t ON o.truckid = t.id
        WHERE o.id = ${req.params.orderId}
      `);
      
      const items = await db.raw(`
        SELECT * FROM "campusCravings"."OrderItem" WHERE orderid = ${req.params.orderId}
      `);
      
      return res.status(200).json({ ...order.rows[0], items: items.rows });
    } catch (err) {
      console.log("Error fetching order:", err.message);
      return res.status(400).json({ error: "Failed to fetch order details" });
    }
  });

  // GET /api/v1/order/truckOwner/:orderId - View order details (Truck Owner)
  app.get('/api/v1/order/truckOwner/:orderId', async (req, res) => {
    try {
      const order = await db.raw(`
        SELECT o.*, t.name as truckName, u.name as customerName, u.email as customerEmail
        FROM "campusCravings"."Order" o
        JOIN "campusCravings"."Truck" t ON o.truckid = t.id
        JOIN "campusCravings"."User" u ON o.userid = u.id
        WHERE o.id = ${req.params.orderId}
      `);
      
      const items = await db.raw(`
        SELECT * FROM "campusCravings"."OrderItem" WHERE orderid = ${req.params.orderId}
      `);
      
      return res.status(200).json({ ...order.rows[0], items: items.rows });
    } catch (err) {
      console.log("Error fetching order:", err.message);
      return res.status(400).json({ error: "Failed to fetch order details" });
    }
  });

  // GET /api/v1/order/truckOrders - View truck's orders (Truck Owner)
  app.get('/api/v1/order/truckOrders', async (req, res) => {
    try {
      const { ownerId } = req.query;
      const result = await db.raw(`
        SELECT o.*, t.name as truckName, u.name as customerName
        FROM "campusCravings"."Order" o
        JOIN "campusCravings"."Truck" t ON o.truckid = t.id
        JOIN "campusCravings"."User" u ON o.userid = u.id
        WHERE t.ownerid = ${ownerId}
        ORDER BY o.createdat DESC
      `);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log("Error fetching truck orders:", err.message);
      return res.status(400).json({ error: "Failed to fetch orders" });
    }
  });

  // PUT /api/v1/order/updateStatus/:orderId - Update order status (Truck Owner)
  app.put('/api/v1/order/updateStatus/:orderId', async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const result = await db.raw(`
        UPDATE "campusCravings"."Order" 
        SET status = '${status}', updatedat = CURRENT_TIMESTAMP
        WHERE id = ${req.params.orderId}
        RETURNING *
      `);
      
      return res.status(200).json({ message: "Order status updated", order: result.rows[0] });
    } catch (err) {
      console.log("Error updating order status:", err.message);
      return res.status(400).json({ error: "Failed to update order status" });
    }
  });
}

module.exports = { handlePrivateBackendApi };
