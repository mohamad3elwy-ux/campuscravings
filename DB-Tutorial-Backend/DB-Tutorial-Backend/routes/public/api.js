// ============================================
// PUBLIC API ROUTES - Campus Cravings
// ============================================
// These routes don't require authentication
// - View trucks, View menus, Login, Register

const db = require('../../connectors/db');

function handlePublicBackendApi(app) {
  
  // Welcome endpoint
  app.get("/", (req, res) => {
    return res.json({
      message: "Welcome to Campus Cravings API",
      version: "1.0.0",
      endpoints: {
        trucks: "/api/v1/trucks/view",
        menu: "/api/v1/menuItem/truck/:truckId",
        login: "/api/v1/auth/login",
        register: "/api/v1/auth/register"
      }
    });
  });

  // ============================================
  // GET /api/v1/trucks/view - View all available trucks (Customer)
  // ============================================
  app.get('/api/v1/trucks/view', async (req, res) => {
    try {
      const result = await db.raw(`
        SELECT t.*, u.name as ownerName 
        FROM "campusCravings"."Truck" t
        LEFT JOIN "campusCravings"."User" u ON t.ownerid = u.id
        WHERE t.isapproved = true AND t.isactive = true
        ORDER BY t.rating DESC
      `);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log("Error fetching trucks:", err.message);
      return res.status(400).json({ error: "Failed to fetch trucks" });
    }
  });

  // ============================================
  // GET /api/v1/menuItem/truck/:truckId - View truck's menu (Customer)
  // ============================================
  app.get('/api/v1/menuItem/truck/:truckId', async (req, res) => {
    try {
      const result = await db.raw(`
        SELECT * FROM "campusCravings"."MenuItem"
        WHERE truckid = ${req.params.truckId} AND isavailable = true
        ORDER BY category, name
      `);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log("Error fetching menu:", err.message);
      return res.status(400).json({ error: "Failed to fetch menu items" });
    }
  });

  // ============================================
  // GET /api/v1/menuItem/truck/:truckId/category/:category - Search by category
  // ============================================
  app.get('/api/v1/menuItem/truck/:truckId/category/:category', async (req, res) => {
    try {
      const result = await db.raw(`
        SELECT * FROM "campusCravings"."MenuItem"
        WHERE truckid = ${req.params.truckId} 
        AND category = '${req.params.category}'
        AND isavailable = true
        ORDER BY name
      `);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log("Error fetching menu by category:", err.message);
      return res.status(400).json({ error: "Failed to fetch menu items" });
    }
  });

  // ============================================
  // POST /api/v1/auth/register - Register new user
  // ============================================
  app.post('/api/v1/auth/register', async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      
      // Check if user exists
      const existing = await db.raw(`
        SELECT * FROM "campusCravings"."User" WHERE email = '${email}'
      `);
      
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: "User already exists" });
      }
      
      // Insert new user (password should be hashed in production)
      const result = await db.raw(`
        INSERT INTO "campusCravings"."User" (name, email, password, role)
        VALUES ('${name}', '${email}', '${password}', '${role || 'customer'}')
        RETURNING id, name, email, role
      `);
      
      return res.status(201).json({
        message: "User registered successfully",
        user: result.rows[0]
      });
    } catch (err) {
      console.log("Error registering user:", err.message);
      return res.status(400).json({ error: "Failed to register user" });
    }
  });

  // ============================================
  // POST /api/v1/auth/login - Login user
  // ============================================
  app.post('/api/v1/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const result = await db.raw(`
        SELECT id, name, email, role FROM "campusCravings"."User"
        WHERE email = '${email}' AND password = '${password}'
      `);
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      return res.status(200).json({
        message: "Login successful",
        user: result.rows[0]
      });
    } catch (err) {
      console.log("Error logging in:", err.message);
      return res.status(400).json({ error: "Failed to login" });
    }
  });

  // ============================================
  // GET /api/v1/trucks/:truckId - Get single truck details
  // ============================================
  app.get('/api/v1/trucks/:truckId', async (req, res) => {
    try {
      const result = await db.raw(`
        SELECT t.*, u.name as ownerName 
        FROM "campusCravings"."Truck" t
        LEFT JOIN "campusCravings"."User" u ON t.ownerid = u.id
        WHERE t.id = ${req.params.truckId}
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Truck not found" });
      }
      
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.log("Error fetching truck:", err.message);
      return res.status(400).json({ error: "Failed to fetch truck" });
    }
  });
}

module.exports = { handlePublicBackendApi };
