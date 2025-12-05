const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-cravings', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const User = require('./models/User');
const FoodTruck = require('./models/FoodTruck');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');

const authRoutes = require('./routes/auth');
const truckRoutes = require('./routes/trucks');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('joinOrderUpdates', (orderId) => {
    socket.join(orderId);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Campus Cravings API Server' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
