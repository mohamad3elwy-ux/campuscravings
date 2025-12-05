============================================
CAMPUS CRAVINGS - Food Truck Order Management System
Backend API Setup Guide
============================================

PREREQUISITES:
1. Node.js (v14 or higher)
2. PostgreSQL (v12 or higher)
3. Visual Studio Code
4. Thunder Client or Postman (for API testing)

============================================
DATABASE SETUP
============================================

1. Open pgAdmin4 and register server
2. Enter "db_server" for Name field
3. Click on Connection tab:
   - Host: localhost
   - Port: 5432
   - Password: (your PostgreSQL password)
4. Click Save

5. Go to: db_server > Databases > postgres > Schemas
6. Click Query Tool (icon next to Browser)
7. Copy and paste the contents of: connectors/scripts.sql
8. Execute the query (F5 or click Execute button)
9. Then copy and paste: connectors/seed.sql
10. Execute to add demo data

============================================
BACKEND SETUP
============================================

1. Open this folder in VS Code
2. Open terminal (Ctrl + `)
3. Install dependencies:
   npm install

4. Update database password:
   - Open connectors/db.js
   - Change password from '123' to your PostgreSQL password

5. Start the server:
   npm run server

============================================
API ENDPOINTS
============================================

PUBLIC ENDPOINTS (No Auth Required):
- GET  /                                    - Welcome message
- GET  /api/v1/trucks/view                  - View all trucks
- GET  /api/v1/trucks/:truckId              - Get truck details
- GET  /api/v1/menuItem/truck/:truckId      - View truck menu
- GET  /api/v1/menuItem/truck/:truckId/category/:category - Filter by category
- POST /api/v1/auth/register                - Register user
- POST /api/v1/auth/login                   - Login user

MENU ITEM MANAGEMENT (Truck Owner):
- POST   /api/v1/menuItem/new               - Create menu item
- GET    /api/v1/menuItem/view              - View my menu items
- GET    /api/v1/menuItem/view/:itemId      - View specific item
- PUT    /api/v1/menuItem/edit/:itemId      - Edit menu item
- DELETE /api/v1/menuItem/delete/:itemId    - Delete menu item

TRUCK MANAGEMENT (Truck Owner):
- GET  /api/v1/trucks/myTruck               - View my trucks
- POST /api/v1/trucks/new                   - Create new truck
- PUT  /api/v1/trucks/updateOrderStatus     - Update availability

CART MANAGEMENT (Customer):
- POST   /api/v1/cart/new                   - Add to cart
- GET    /api/v1/cart/view                  - View cart
- PUT    /api/v1/cart/edit/:cartId          - Update quantity
- DELETE /api/v1/cart/delete/:cartId        - Remove from cart

ORDER MANAGEMENT:
- POST /api/v1/order/new                    - Place order (Customer)
- GET  /api/v1/order/myOrders               - View my orders (Customer)
- GET  /api/v1/order/details/:orderId       - Order details (Customer)
- GET  /api/v1/order/truckOwner/:orderId    - Order details (Truck Owner)
- GET  /api/v1/order/truckOrders            - Truck orders (Truck Owner)
- PUT  /api/v1/order/updateStatus/:orderId  - Update status (Truck Owner)

============================================
DEMO CREDENTIALS
============================================

Admin:
  Email: admin@campus.edu
  Password: admin123

Truck Manager:
  Email: manager@campus.edu
  Password: manager123

Student/Customer:
  Email: student@campus.edu
  Password: password123

============================================
TEST THE API
============================================

1. Start server: npm run server
2. Open browser: http://localhost:3000/
3. Test endpoints:
   - http://localhost:3000/api/v1/trucks/view
   - http://localhost:3000/api/v1/menuItem/truck/1

Use Thunder Client in VS Code to test POST/PUT/DELETE requests.
