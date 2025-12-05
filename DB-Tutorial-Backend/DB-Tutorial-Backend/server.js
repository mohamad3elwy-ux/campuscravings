const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const {handlePrivateBackendApi} = require('./routes/private/api');
const {handlePublicBackendApi} = require('./routes/public/api');
const {authMiddleware} = require('./middleware/auth');

// ============================================
// CAMPUS CRAVINGS - FOOD TRUCK ORDER MANAGEMENT SYSTEM
// ============================================
// This backend handles:
// - User authentication (customers, truck owners, admins)
// - Food truck management (CRUD operations)
// - Menu item management
// - Cart management
// - Order processing and status updates

// Enable CORS for frontend communication
app.use(cors());

// Handle post, delete and put request
// Parse JSON request bodies for API endpoints
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

// PUBLIC ROUTES - No authentication required
// - Login, Register, View trucks, View menus
handlePublicBackendApi(app);

// AUTHENTICATION MIDDLEWARE
// Validates database connection and user session
app.use(authMiddleware);

// PRIVATE ROUTES - Authentication required
// - Truck management, Order management, Cart operations
handlePrivateBackendApi(app);

// Server configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("===========================================");
    console.log("  CAMPUS CRAVINGS - Food Truck Backend");
    console.log("===========================================");
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`API Endpoints:`);
    console.log(`  - GET  /api/v1/trucks/view`);
    console.log(`  - GET  /api/v1/menuItem/truck/:truckId`);
    console.log(`  - POST /api/v1/order/new`);
    console.log(`  - GET  /api/v1/order/myOrders`);
    console.log("===========================================");
});







