# Campus Cravings Backend API

## API Endpoints Quick Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login user |
| GET | /api/v1/auth/me | Get current user |

### Menu Item Management (Truck Owner)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/v1/menuItem/new | Truck Owner | Create menu item |
| GET | /api/v1/menuItem/view | Truck Owner | View my menu items |
| GET | /api/v1/menuItem/view/:itemId | Truck Owner | View specific menu item |
| PUT | /api/v1/menuItem/edit/:itemId | Truck Owner | Edit menu item |
| DELETE | /api/v1/menuItem/delete/:itemId | Truck Owner | Delete menu item |

### Truck Management
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /api/v1/trucks/view | Customer | View all available trucks |
| GET | /api/v1/trucks/myTruck | Truck Owner | View my truck info |
| PUT | /api/v1/trucks/updateOrderStatus | Truck Owner | Update truck availability |

### Browse Menu (Customer)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /api/v1/menuItem/truck/:truckId | Customer | View truck's menu |
| GET | /api/v1/menuItem/truck/:truckId/category/:category | Customer | Search menu by category |

### Cart Management (Customer)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/v1/cart/new | Customer | Add item to cart |
| GET | /api/v1/cart/view | Customer | View cart |
| PUT | /api/v1/cart/edit/:cartId | Customer | Update cart quantity |
| DELETE | /api/v1/cart/delete/:cartId | Customer | Remove from cart |

### Order Management
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/v1/order/new | Customer | Place order |
| GET | /api/v1/order/myOrders | Customer | View my orders |
| GET | /api/v1/order/details/:orderId | Customer | View order details |
| GET | /api/v1/order/truckOwner/:orderId | Truck Owner | View order details |
| GET | /api/v1/order/truckOrders | Truck Owner | View truck's orders |
| PUT | /api/v1/order/updateStatus/:orderId | Truck Owner | Update order status |

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Start MongoDB (if using local):
```bash
mongod
```

4. Run the server:
```bash
npm run dev
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens

## User Roles

- **customer** - Can browse trucks, add to cart, place orders
- **truck_owner** - Can manage trucks, menu items, view/update orders
- **admin** - Full access to all features
