import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';

import Home from '../pages/Home';
import FoodTrucks from '../pages/FoodTrucks';
import TruckDetail from '../pages/TruckDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Orders from '../pages/Orders';
import OrderDetail from '../pages/OrderDetail';
import AdminDashboard from '../pages/AdminDashboard';
import TruckManagerDashboard from '../pages/TruckManagerDashboard';
import ManagerOrders from '../pages/ManagerOrders';
import { useAuth } from '../contexts/AuthContext';

// Authentication required for protected routes
function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
}

// Determine transition direction based on page hierarchy
const getDirection = (pathname) => {
  if (pathname === '/profile') return 'up';   // Profile - keep the amazing up transition
  if (pathname === '/') return 'right';      // Home - slide right (from left)
  if (pathname === '/trucks') return 'right'; // Food Trucks - slide right (from left)
  if (pathname === '/orders') return 'left'; // Orders - slide left (from right)
  if (pathname === '/admin') return 'right';   // Admin - slide right (from left)
  if (pathname === '/manager') return 'right'; // Manager - slide right (from left)
  if (pathname === '/login') return 'right';     // Login - slide right (from left)
  if (pathname === '/register') return 'right';  // Register - slide right (from left)
  if (pathname.includes('/trucks/')) return 'right'; // Truck detail - slide right (from left)
  if (pathname.includes('/orders/')) return 'left'; // Order detail - slide left (from right)
  return 'right'; // Default
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const direction = getDirection(location.pathname);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition direction="left">
            <Home />
          </PageTransition>
        } />
        
        <Route path="/trucks" element={
          <PageTransition direction="left">
            <FoodTrucks />
          </PageTransition>
        } />
        
        <Route path="/trucks/:id" element={
          <PageTransition direction="left">
            <TruckDetail />
          </PageTransition>
        } />
        
        <Route path="/login" element={
          <PageTransition direction="left">
            <Login />
          </PageTransition>
        } />
        
        <Route path="/register" element={
          <PageTransition direction="left">
            <Register />
          </PageTransition>
        } />
        
        <Route path="/profile" element={
          <PageTransition direction="up">
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </PageTransition>
        } />
        
        <Route path="/orders" element={
          <PageTransition direction="right">
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          </PageTransition>
        } />
        
        <Route path="/orders/:id" element={
          <PageTransition direction="right">
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          </PageTransition>
        } />
        
        <Route path="/admin" element={
          <PageTransition direction="left">
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          </PageTransition>
        } />
        
        <Route path="/manager" element={
          <PageTransition direction="left">
            <ProtectedRoute requiredRole="truck_manager">
              <TruckManagerDashboard />
            </ProtectedRoute>
          </PageTransition>
        } />
        
        <Route path="/manager/orders" element={
          <PageTransition direction="left">
            <ProtectedRoute requiredRole="truck_manager">
              <ManagerOrders />
            </ProtectedRoute>
          </PageTransition>
        } />
        
        <Route path="*" element={
          <PageTransition direction="left">
            <Navigate to="/" />
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
