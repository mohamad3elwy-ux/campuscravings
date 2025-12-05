import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';

import Navbar from './components/Navbar';
import AnimatedRoutes from './components/AnimatedRoutes';

import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Component to handle redirect logic
function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if there's a stored redirect path
    const redirectPath = sessionStorage.getItem('redirectPath');
    
    if (redirectPath && redirectPath !== location.pathname) {
      console.log('🔄 Redirecting to stored path:', redirectPath);
      // Clear the stored path
      sessionStorage.removeItem('redirectPath');
      // Navigate to the stored path
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, location]);

  return null;
}

function AppRoutes() {
  return (
    <Router>
      <RedirectHandler />
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <AnimatedRoutes />
        </main>
        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2025 Campus Cravings - Made by Hofra</p>
          </div>
        </footer>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 1000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 1000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 1000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
          gutter={8}
          containerStyle={{
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      </div>
    </Router>
  );
}

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // DISABLED SOCKET.IO - No connection needed for mock version
    console.log('Socket.IO disabled for mock version');
    setSocket(null);
  }, []);

  return (
    <AuthProvider>
      <SocketProvider socket={socket}>
        <AppRoutes />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
