import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children, socket }) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from server');
    });

    socket.on('orderStatusUpdate', (order) => {
      toast.success(`Order #${order.orderNumber} status updated to ${order.status}`);
    });

    socket.on('orderCreated', (order) => {
      toast.success(`New order #${order.orderNumber} received!`);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('orderStatusUpdate');
      socket.off('orderCreated');
    };
  }, [socket]);

  const joinOrderUpdates = (orderId) => {
    if (socket && connected) {
      socket.emit('joinOrderUpdates', orderId);
    }
  };

  const leaveOrderUpdates = (orderId) => {
    if (socket && connected) {
      socket.emit('leaveOrderUpdates', orderId);
    }
  };

  const value = {
    socket,
    connected,
    joinOrderUpdates,
    leaveOrderUpdates
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
