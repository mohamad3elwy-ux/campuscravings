-- ============================================
-- CAMPUS CRAVINGS - Food Truck Order Management System
-- Database Schema for PostgreSQL
-- ============================================

-- Create schema for Campus Cravings
CREATE SCHEMA IF NOT EXISTS "campusCravings";

-- ============================================
-- USERS TABLE - Customers, Truck Owners, Admins
-- ============================================
CREATE TABLE IF NOT EXISTS "campusCravings"."User" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer', -- customer, truck_owner, admin
    profilePicture TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TRUCKS TABLE - Food Truck Information
-- ============================================
CREATE TABLE IF NOT EXISTS "campusCravings"."Truck" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    ownerId INTEGER REFERENCES "campusCravings"."User"(id),
    coverPicture TEXT,
    openTime TEXT DEFAULT '08:00',
    closeTime TEXT DEFAULT '20:00',
    isActive BOOLEAN DEFAULT true,
    isApproved BOOLEAN DEFAULT false,
    isRejected BOOLEAN DEFAULT false,
    rating DECIMAL(2,1) DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MENU ITEMS TABLE - Food Items for Each Truck
-- ============================================
CREATE TABLE IF NOT EXISTS "campusCravings"."MenuItem" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT DEFAULT 'Main', -- Main, Sides, Drinks, Desserts
    truckId INTEGER REFERENCES "campusCravings"."Truck"(id) ON DELETE CASCADE,
    image TEXT,
    ingredients TEXT,
    allergens TEXT,
    preparationTime INTEGER DEFAULT 15,
    isAvailable BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CART TABLE - Shopping Cart for Customers
-- ============================================
CREATE TABLE IF NOT EXISTS "campusCravings"."Cart" (
    id SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES "campusCravings"."User"(id) ON DELETE CASCADE,
    truckId INTEGER REFERENCES "campusCravings"."Truck"(id) ON DELETE CASCADE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CART ITEMS TABLE - Items in Cart
-- ============================================
CREATE TABLE IF NOT EXISTS "campusCravings"."CartItem" (
    id SERIAL PRIMARY KEY,
    cartId INTEGER REFERENCES "campusCravings"."Cart"(id) ON DELETE CASCADE,
    menuItemId INTEGER REFERENCES "campusCravings"."MenuItem"(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    specialInstructions TEXT
);

-- ============================================
-- ORDERS TABLE - Customer Orders
-- ============================================
CREATE TABLE IF NOT EXISTS "campusCravings"."Order" (
    id SERIAL PRIMARY KEY,
    orderNumber TEXT UNIQUE NOT NULL,
    userId INTEGER REFERENCES "campusCravings"."User"(id),
    truckId INTEGER REFERENCES "campusCravings"."Truck"(id),
    totalAmount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, confirmed, preparing, ready, completed, cancelled
    pickupStartTime TIMESTAMP,
    pickupEndTime TIMESTAMP,
    customerName TEXT,
    customerEmail TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ORDER ITEMS TABLE - Items in Each Order
-- ============================================
CREATE TABLE IF NOT EXISTS "campusCravings"."OrderItem" (
    id SERIAL PRIMARY KEY,
    orderId INTEGER REFERENCES "campusCravings"."Order"(id) ON DELETE CASCADE,
    menuItemId INTEGER REFERENCES "campusCravings"."MenuItem"(id),
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    specialInstructions TEXT
);



