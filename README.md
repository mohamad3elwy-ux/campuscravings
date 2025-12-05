# Campus Cravings - Food Truck Management System

A full-stack MERN application for managing food trucks on a university campus. Students can browse food trucks, place orders with 15-minute pickup slots, and track their orders in real-time.

## Features

### For Students
- 🍔 Browse available food trucks and their menus
- ⏰ 15-minute pickup slots perfect for class breaks
- 📱 Real-time order tracking with countdown timers
- ⭐ Rate and review food trucks
- 📊 Order history and account management

### For Food Truck Managers
- 🚚 Manage truck information and operating hours
- 📋 Create and update menu items
- 📈 View order statistics and analytics
- ⚡ Real-time order status updates
- 💰 Revenue tracking

### For Administrators
- 👥 User management and roles
- 📊 System-wide analytics
- 🚚 Food truck approvals
- 📈 Revenue and usage statistics

## Tech Stack

- **Frontend**: React 18, TailwindCSS, Lucide Icons
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io for live order updates

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campus-cravings
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MongoDB connection string and JWT secret:
   ```
   MONGODB_URI=mongodb://localhost:27017/campus-cravings
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```

5. **Seed the database with sample data**
   ```bash
   node seed.js
   ```

6. **Start the development servers**
   ```bash
   npm run dev
   ```
   This will start both the backend server (port 5000) and frontend (port 3000) concurrently.

### Manual Startup

If you prefer to start servers separately:

1. **Start the backend server**
   ```bash
   npm run server
   ```

2. **Start the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Food Trucks
- `GET /api/trucks` - Get all food trucks
- `GET /api/trucks/:id` - Get specific truck
- `POST /api/trucks` - Create new truck (auth required)
- `PUT /api/trucks/:id` - Update truck (auth required)
- `DELETE /api/trucks/:id` - Delete truck (auth required)

### Menu Items
- `GET /api/menu` - Get menu items
- `GET /api/menu/:id` - Get specific menu item
- `POST /api/menu` - Create menu item (auth required)
- `PUT /api/menu/:id` - Update menu item (auth required)
- `DELETE /api/menu/:id` - Delete menu item (auth required)

### Orders
- `GET /api/orders` - Get user orders (auth required)
- `GET /api/orders/:id` - Get specific order (auth required)
- `POST /api/orders` - Create new order (auth required)
- `PATCH /api/orders/:id/status` - Update order status (auth required)

## Demo Accounts

### Student Account
- **Email**: student@campus.edu
- **Password**: password123

### Admin Account
- **Email**: admin@campus.edu
- **Password**: admin123

### Truck Manager Account
- **Email**: manager@campus.edu
- **Password**: manager123

## Project Structure

```
campus-cravings/
├── backend/
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── middleware/      # Custom middleware
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   └── App.js       # Main App component
│   └── public/          # Static files
├── database/
│   └── schema.sql       # Original SQL schema
├── seed.js              # Database seeding script
├── server.js            # Entry point
├── .env                 # Environment variables
└── README.md            # This file
```

## Key Features Explained

### 15-Minute Pickup Slots
The system uses 15-minute time slots to optimize pickup efficiency. Students can:
- View available pickup times
- Reserve specific slots
- Receive countdown timers for their pickup window

### Real-time Order Tracking
Using Socket.io, the application provides:
- Live order status updates
- Countdown timers for ready orders
- Real-time notifications for order changes

### Role-based Access Control
Three user roles with different permissions:
- **Students**: Browse menus, place orders, track orders
- **Truck Managers**: Manage their trucks, menus, and orders
- **Administrators**: Full system management and analytics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Built by Team 7ofra - GIU

Made with ❤️ for university students who deserve better food ordering experiences!
