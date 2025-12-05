import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Check if there's a stored user from website login
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
        console.log('Restored logged in user:', userData);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
  }, []);

  const fetchUser = async () => {
    try {
      // MOCK USER DATA - Get from localStorage
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      console.log('FETCH USER - Stored token:', storedToken);
      console.log('FETCH USER - Stored user:', storedUser);
      
      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('FETCH USER - Parsed user data:', userData);
        setUser(userData);
      } else {
        console.log('FETCH USER - No stored data found');
        logout();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('SIMPLE LOGIN - Email:', email, 'Password:', password);
      
      // SIMPLE CREDENTIAL CHECK FOR DEFAULT USERS
      if (email === 'admin@campus.edu' && password === 'admin123') {
        const token = 'mock-admin-token-' + Date.now();
        const userData = {
          _id: 'user1',
          name: 'Admin User',
          email: 'admin@campus.edu',
          role: 'admin'
        };
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(token);
        setUser(userData);
        
        toast.success('Admin login successful!');
        console.log('ADMIN LOGIN SUCCESS');
        return { success: true };
      }
      
      if (email === 'manager@campus.edu' && password === 'manager123') {
        const token = 'mock-manager-token-' + Date.now();
        const userData = {
          _id: 'user3',
          name: 'Sarah Manager',
          email: 'manager@campus.edu',
          role: 'truck_manager'
        };
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(token);
        setUser(userData);
        
        toast.success('Manager login successful!');
        console.log('MANAGER LOGIN SUCCESS');
        return { success: true };
      }
      
      if (email === 'student@campus.edu' && password === 'password123') {
        const token = 'mock-student-token-' + Date.now();
        const userData = {
          _id: 'user2',
          name: 'John Student',
          email: 'student@campus.edu',
          role: 'student',
          studentId: 'STU001'
        };
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(token);
        setUser(userData);
        
        toast.success('Student login successful!');
        console.log('STUDENT LOGIN SUCCESS');
        return { success: true };
      }
      
      // CHECK FOR REGISTERED USERS IN LOCAL STORAGE
      const registeredUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const foundUser = registeredUsers.find(user => user.email === email);
      
      if (foundUser) {
        // For mock system, any password works for registered users
        // In production, you'd verify the actual password
        const token = 'mock-token-' + foundUser.role + '-' + Date.now();
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(foundUser));
        setToken(token);
        setUser(foundUser);
        
        toast.success(`${foundUser.role.charAt(0).toUpperCase() + foundUser.role.slice(1)} login successful!`);
        console.log('REGISTERED USER LOGIN SUCCESS:', foundUser);
        return { success: true };
      }
      
      console.log('LOGIN FAILED - INVALID CREDENTIALS');
      throw new Error('Invalid credentials');
    } catch (error) {
      console.error('LOGIN ERROR:', error);
      const message = error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    // MOCK REGISTRATION
    try {
      console.log('MOCK REGISTER - User data:', userData);
      
      // Check if email already exists (in our mock system)
      const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const emailExists = existingUsers.some(user => user.email === userData.email);
      
      if (emailExists) {
        throw new Error('Email already registered');
      }
      
      // Create new user
      const newUser = {
        _id: 'user-' + Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone || '',
        studentId: userData.studentId || '',
        createdAt: new Date().toISOString()
      };
      
      // Generate mock token
      const token = 'mock-token-' + userData.role + '-' + Date.now();
      
      // Store user in localStorage
      existingUsers.push(newUser);
      localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
      
      // Set auth state
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(token);
      setUser(newUser);
      
      toast.success('Registration successful!');
      console.log('REGISTRATION SUCCESS - New user:', newUser);
      return { success: true };
    } catch (error) {
      console.error('REGISTRATION ERROR:', error);
      const message = error.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
