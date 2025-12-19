# Campus Cravings - Milestone 4

## Team Hofra - GIU

A food truck ordering system built with Node.js, Express, PostgreSQL, and jQuery AJAX.

## Live Demo

**URL:** https://hofra.onrender.com

## Login Credentials

### Customer Account
- **Email:** ahmed@example.com
- **Password:** password123

### Truck Owner Account
- **Email:** sara@example.com
- **Password:** password123

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** HJS Templates, Bootstrap, jQuery
- **Database:** PostgreSQL (hosted on Railway)
- **Hosting:** Render.com

## Project Structure

```
milestoneBackend/
├── views/                  # HJS template files
│   ├── login.hjs
│   ├── register.hjs
│   ├── customerHomepage.hjs
│   ├── trucks.hjs
│   ├── truckMenu.hjs
│   ├── cart.hjs
│   ├── myOrders.hjs
│   ├── ownerDashboard.hjs
│   ├── ownerMenu.hjs
│   ├── ownerMenuAdd.hjs
│   ├── ownerMenuEdit.hjs
│   └── ownerOrders.hjs
├── public/
│   ├── src/                # jQuery JavaScript files
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── customerHomepage.js
│   │   ├── trucks.js
│   │   ├── truckMenu.js
│   │   ├── cart.js
│   │   ├── myOrders.js
│   │   ├── ownerDashboard.js
│   │   ├── ownerMenu.js
│   │   ├── ownerMenuAdd.js
│   │   ├── ownerMenuEdit.js
│   │   └── ownerOrders.js
│   ├── styles/
│   │   └── style.css       # Main stylesheet
│   └── logo.png            # Campus Cravings logo
├── connectors/
│   ├── db.js               # Database connection export
│   ├── knex.js             # Knex configuration
│   └── scripts.sql         # Database schema and seed data
├── routes/
│   ├── api/                # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── trucks.js
│   │   ├── menu.js
│   │   ├── orders.js
│   │   └── cart.js
│   └── publicViews.js      # View routes
├── server.js               # Main server file
├── package.json
└── README.md
```

## Features

### Customer Features
- Browse available food trucks
- View truck menus with prices
- Add items to cart
- Place orders with scheduled pickup time
- View order history and status

### Owner Features
- Dashboard with truck statistics
- Manage menu items (add, edit, delete)
- View and manage incoming orders
- Update order status (pending → preparing → ready → completed)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/logout` - User logout

### Trucks
- `GET /api/trucks` - Get all trucks
- `GET /api/trucks/:id` - Get truck by ID

### Menu
- `GET /api/menu/:truckId` - Get menu items for a truck
- `POST /api/menu` - Add menu item (owner)
- `PUT /api/menu/:id` - Update menu item (owner)
- `DELETE /api/menu/:id` - Delete menu item (owner)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/owner` - Get orders for owner's truck
- `PUT /api/orders/:id/status` - Update order status

## Screenshots

### Login Page
![Login](screenshots/login.png)

### Customer Homepage
![Homepage](screenshots/homepage.png)

### Food Trucks Listing
![Trucks](screenshots/trucks.png)

### Truck Menu
![Menu](screenshots/menu.png)

### Shopping Cart
![Cart](screenshots/cart.png)

### My Orders
![Orders](screenshots/orders.png)

### Owner Dashboard
![Owner Dashboard](screenshots/owner-dashboard.png)

### Owner Menu Management
![Owner Menu](screenshots/owner-menu.png)

### Owner Orders
![Owner Orders](screenshots/owner-orders.png)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   ```
4. Run the database schema:
   ```bash
   psql -d your_database -f connectors/scripts.sql
   ```
5. Start the server:
   ```bash
   npm start
   ```

## Team Members

| ID | Tutorial |
|----|----------|
| [Your ID] | [Your Tutorial] |
| [Partner ID] | [Partner Tutorial] |

## GitHub Repository

https://github.com/mohamad3elwy-ux/campuscravings

## Built with ❤️ by Team Hofra - GIU
