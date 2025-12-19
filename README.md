# Campus Cravings - GIU Food Truck System

## Milestone 4 - Frontend Implementation

### Team Hofra - German International University

A comprehensive food truck ordering system for GIU campus, built with Node.js, Express, PostgreSQL, and jQuery AJAX.

---

## 1. Project Description & Team Members

| Name | ID | Tutorial |
|------|-----|----------|
| [Member 1 Name] | [ID] | [Tutorial] |
| [Member 2 Name] | [ID] | [Tutorial] |

---

## 2. Features

### Customer Features
- **User Authentication** - Register and login with email/password
- **Browse Food Trucks** - View all available food trucks on campus
- **View Menus** - Browse menu items with filtering by category
- **Shopping Cart** - Add items, modify quantities, remove items
- **Place Orders** - Submit orders with scheduled pickup time
- **Order Tracking** - View order history and current status

### Truck Owner Features
- **Dashboard** - View truck statistics and quick actions
- **Menu Management** - Add, edit, and delete menu items
- **Order Management** - View incoming orders, update status
- **Availability Control** - Toggle truck order availability

---

## 3. Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML (HJS Templates), CSS, Bootstrap, JavaScript, jQuery, AJAX |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Hosting** | Render.com (Web App), Railway (Database) |

---

## 4. Entity Relationship Diagram (ERD)

```
+------------------+       +------------------+       +------------------+
|     Users        |       |     Trucks       |       |   MenuItems      |
+------------------+       +------------------+       +------------------+
| userId (PK)      |<----->| truckId (PK)     |<----->| itemId (PK)      |
| name             |       | truckName        |       | truckId (FK)     |
| email (UNIQUE)   |       | truckLogo        |       | name             |
| password         |       | ownerId (FK)     |       | description      |
| role             |       | truckStatus      |       | price            |
| birthDate        |       | orderStatus      |       | category         |
| createdAt        |       | createdAt        |       | status           |
+------------------+       +------------------+       | createdAt        |
        |                          |                  +------------------+
        |                          |                          |
        v                          v                          v
+------------------+       +------------------+       +------------------+
|     Orders       |       |   OrderItems     |       |     Carts        |
+------------------+       +------------------+       +------------------+
| orderId (PK)     |<----->| orderItemId (PK) |       | cartId (PK)      |
| userId (FK)      |       | orderId (FK)     |       | userId (FK)      |
| truckId (FK)     |       | itemId (FK)      |       | itemId (FK)      |
| orderStatus      |       | quantity         |       | quantity         |
| totalPrice       |       | price            |       | price            |
| scheduledPickup  |       +------------------+       +------------------+
| createdAt        |
+------------------+       +------------------+
                           |    Sessions      |
                           +------------------+
                           | id (PK)          |
                           | userId (FK)      |
                           | token            |
                           | expiresAt        |
                           +------------------+
```

### Database Tables

| Table | Description |
|-------|-------------|
| **Users** | Stores customer and truck owner accounts |
| **Trucks** | Food truck information and status |
| **MenuItems** | Menu items for each truck |
| **Orders** | Customer orders with status tracking |
| **OrderItems** | Individual items within each order |
| **Carts** | Shopping cart items per user |
| **Sessions** | User authentication sessions |

---

## 5. Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm package manager

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/mohamad3elwy-ux/campuscravings.git
   cd campuscravings
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file or set:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

4. **Initialize the database**
   ```bash
   psql -d your_database -f connectors/scripts.sql
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Access the application**
   Open http://localhost:3000 in your browser

---

## 6. Test Credentials

### Customer Account
| Field | Value |
|-------|-------|
| **Email** | ahmed@example.com |
| **Password** | password123 |

### Truck Owner Account
| Field | Value |
|-------|-------|
| **Email** | sara@example.com |
| **Password** | password123 |

### Live Demo
**URL:** https://hofra.onrender.com

---

## 7. Screenshots

### Public Pages

#### Login Page
![Login](screenshots/login.png)

#### Register Page
![Register](screenshots/register.png)

### Customer Pages

#### Customer Dashboard
![Dashboard](screenshots/dashboard.png)

#### Browse Food Trucks
![Trucks](screenshots/trucks.png)

#### Truck Menu
![Menu](screenshots/menu.png)

#### Shopping Cart
![Cart](screenshots/cart.png)

#### My Orders
![Orders](screenshots/orders.png)

### Truck Owner Pages

#### Owner Dashboard
![Owner Dashboard](screenshots/owner-dashboard.png)

#### Menu Items Management
![Menu Items](screenshots/menu-items.png)

#### Add Menu Item
![Add Menu Item](screenshots/add-menu-item.png)

#### Truck Orders
![Truck Orders](screenshots/truck-orders.png)

---

## 8. API Endpoints Summary

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/user` | Register new user |
| POST | `/api/v1/user/login` | User login |

### Customer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/trucks/view` | View available trucks |
| GET | `/api/v1/menuItem/truck/:truckId` | View truck menu |
| GET | `/api/v1/menuItem/truck/:truckId/category/:category` | Filter by category |
| POST | `/api/v1/cart/new` | Add item to cart |
| GET | `/api/v1/cart/view` | View cart |
| PUT | `/api/v1/cart/edit/:cartId` | Update cart quantity |
| DELETE | `/api/v1/cart/delete/:cartId` | Remove from cart |
| POST | `/api/v1/order/new` | Place order |
| GET | `/api/v1/order/myOrders` | View my orders |
| GET | `/api/v1/order/details/:orderId` | View order details |

### Truck Owner Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/menuItem/new` | Create menu item |
| GET | `/api/v1/menuItem/view` | View my menu items |
| GET | `/api/v1/menuItem/view/:itemId` | View specific item |
| PUT | `/api/v1/menuItem/edit/:itemId` | Edit menu item |
| DELETE | `/api/v1/menuItem/delete/:itemId` | Delete menu item |
| GET | `/api/v1/trucks/myTruck` | View my truck info |
| PUT | `/api/v1/trucks/updateOrderStatus` | Update availability |
| GET | `/api/v1/order/truckOwner/:orderId` | View order details |
| GET | `/api/v1/order/truckOrders` | View truck orders |
| PUT | `/api/v1/order/updateStatus/:orderId` | Update order status |

---

## 9. Project Structure

```
milestoneBackend/
├── connectors/
│   ├── db.js                 # Database connection export
│   ├── knex.js               # Knex configuration
│   └── scripts.sql           # SQL schema and seed data
├── middleware/
│   └── auth.js               # Authentication middleware
├── public/
│   ├── src/                  # JavaScript files (jQuery/AJAX)
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── trucks.js
│   │   ├── truckMenu.js
│   │   ├── cart.js
│   │   ├── myOrders.js
│   │   ├── ownerDashboard.js
│   │   ├── menuItems.js
│   │   ├── addMenuItem.js
│   │   └── truckOrders.js
│   └── styles/
│       └── style.css         # Custom CSS styles
├── routes/
│   ├── private/
│   │   ├── api.js            # Protected API endpoints
│   │   └── view.js           # Protected view routes
│   └── public/
│       ├── api.js            # Public API (register/login)
│       └── view.js           # Public view routes
├── utils/
│   └── session.js            # Session helper functions
├── views/                    # Hogan.js templates
│   ├── login.hjs
│   ├── register.hjs
│   ├── customerHomepage.hjs
│   ├── trucks.hjs
│   ├── truckMenu.hjs
│   ├── cart.hjs
│   ├── myOrders.hjs
│   ├── ownerDashboard.hjs
│   ├── menuItems.hjs
│   ├── addMenuItem.hjs
│   └── truckOrders.hjs
├── screenshots/              # Page screenshots
├── server.js                 # Application entry point
├── package.json
└── README.md
```

---

## 10. Contributors

### Team Hofra

| Contribution | Member |
|--------------|--------|
| Backend API Development | [Member Name] |
| Frontend Templates | [Member Name] |
| jQuery/AJAX Implementation | [Member Name] |
| Database Design | [Member Name] |
| Testing & Documentation | [Member Name] |

---

## GitHub Repository

https://github.com/mohamad3elwy-ux/campuscravings

---

## Built with ❤️ by Team Hofra - German International University

**Software Engineering, Winter 2025**
