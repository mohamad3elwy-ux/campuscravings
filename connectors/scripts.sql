-- ====================================
-- GIU Food Truck Management System
-- Database Schema Script - Milestone 3
-- ====================================

-- Drop tables if they exist (in reverse order due to foreign key constraints)
DROP TABLE IF EXISTS "FoodTruck"."Sessions" CASCADE;
DROP TABLE IF EXISTS "FoodTruck"."Carts" CASCADE;
DROP TABLE IF EXISTS "FoodTruck"."OrderItems" CASCADE;
DROP TABLE IF EXISTS "FoodTruck"."Orders" CASCADE;
DROP TABLE IF EXISTS "FoodTruck"."MenuItems" CASCADE;
DROP TABLE IF EXISTS "FoodTruck"."Trucks" CASCADE;
DROP TABLE IF EXISTS "FoodTruck"."Users" CASCADE;

-- Create schema
CREATE SCHEMA IF NOT EXISTS "FoodTruck";

-- Users Table
CREATE TABLE IF NOT EXISTS "FoodTruck"."Users" (
  "userId" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "role" TEXT DEFAULT 'customer',
  "birthDate" DATE DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trucks Table
CREATE TABLE IF NOT EXISTS "FoodTruck"."Trucks" (
  "truckId" SERIAL PRIMARY KEY,
  "truckName" TEXT NOT NULL UNIQUE,
  "truckLogo" TEXT,
  "ownerId" INTEGER NOT NULL,
  "truckStatus" TEXT DEFAULT 'available',
  "orderStatus" TEXT DEFAULT 'available',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("ownerId") REFERENCES "FoodTruck"."Users"("userId") ON DELETE CASCADE
);

-- MenuItems Table
CREATE TABLE IF NOT EXISTS "FoodTruck"."MenuItems" (
  "itemId" SERIAL PRIMARY KEY,
  "truckId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" NUMERIC(10,2) NOT NULL,
  "category" TEXT NOT NULL,
  "status" TEXT DEFAULT 'available',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("truckId") REFERENCES "FoodTruck"."Trucks"("truckId") ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS "FoodTruck"."Orders" (
  "orderId" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "truckId" INTEGER NOT NULL,
  "orderStatus" TEXT NOT NULL,
  "totalPrice" NUMERIC(10,2) NOT NULL,
  "scheduledPickupTime" TIMESTAMP,
  "estimatedEarliestPickup" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "FoodTruck"."Users"("userId") ON DELETE CASCADE,
  FOREIGN KEY ("truckId") REFERENCES "FoodTruck"."Trucks"("truckId") ON DELETE CASCADE
);

-- OrderItems Table
CREATE TABLE IF NOT EXISTS "FoodTruck"."OrderItems" (
  "orderItemId" SERIAL PRIMARY KEY,
  "orderId" INTEGER NOT NULL,
  "itemId" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" NUMERIC(10,2) NOT NULL,
  FOREIGN KEY ("orderId") REFERENCES "FoodTruck"."Orders"("orderId") ON DELETE CASCADE,
  FOREIGN KEY ("itemId") REFERENCES "FoodTruck"."MenuItems"("itemId") ON DELETE CASCADE
);

-- Carts Table
CREATE TABLE IF NOT EXISTS "FoodTruck"."Carts" (
  "cartId" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "itemId" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" NUMERIC(10,2) NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "FoodTruck"."Users"("userId") ON DELETE CASCADE,
  FOREIGN KEY ("itemId") REFERENCES "FoodTruck"."MenuItems"("itemId") ON DELETE CASCADE
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS "FoodTruck"."Sessions" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "token" TEXT NOT NULL,
  "expiresAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "FoodTruck"."Users"("userId") ON DELETE CASCADE
);

-- ====================================
-- Sample Data
-- ====================================

-- Sample Users (password is plain text for testing)
INSERT INTO "FoodTruck"."Users" ("name", "email", "password", "role", "birthDate")
VALUES 
  ('Ahmed Mohamed', 'ahmed@example.com', 'password123', 'customer', '1998-05-15'),
  ('Sara Ali', 'sara@example.com', 'password123', 'truckOwner', '2000-08-22'),
  ('Khaled Hassan', 'khaled@example.com', 'password123', 'truckOwner', '1995-03-10');

-- Sample Trucks
INSERT INTO "FoodTruck"."Trucks" ("truckName", "truckLogo", "ownerId", "truckStatus", "orderStatus")
VALUES 
  ('Tasty Tacos Truck', 'https://example.com/taco-logo.png', 2, 'available', 'available'),
  ('Burger Paradise', 'https://example.com/burger-logo.png', 3, 'available', 'available');

-- Sample Menu Items
INSERT INTO "FoodTruck"."MenuItems" ("truckId", "name", "description", "price", "category", "status")
VALUES 
  (1, 'Beef Burger', 'Delicious beef burger with cheese', 45.99, 'Main Course', 'available'),
  (1, 'Chicken Wrap', 'Grilled chicken wrap with vegetables', 35.50, 'Main Course', 'available'),
  (1, 'French Fries', 'Crispy golden fries', 15.00, 'Sides', 'available'),
  (1, 'Soft Drink', 'Cold refreshing drink', 10.00, 'Beverages', 'available'),
  (2, 'Classic Burger', 'Juicy beef patty with special sauce', 42.00, 'Main Course', 'available'),
  (2, 'Cheese Fries', 'Fries topped with melted cheddar', 18.00, 'Sides', 'available');

-- Sample Session for testing (token: test-token-sara for truckOwner Sara)
INSERT INTO "FoodTruck"."Sessions" ("userId", "token", "expiresAt")
VALUES 
  (1, 'test-token-ahmed', NOW() + INTERVAL '24 hours'),
  (2, 'test-token-sara', NOW() + INTERVAL '24 hours'),
  (3, 'test-token-khaled', NOW() + INTERVAL '24 hours');
