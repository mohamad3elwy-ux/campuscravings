import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Package, Eye, Filter, Search, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Orders = () => {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchOrders();
    
    // Listen for order status updates
    const interval = setInterval(() => {
      checkForOrderUpdates();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [filter]);

  const checkForOrderUpdates = () => {
    const storedOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
    const userOrders = storedOrders.filter(order => 
      order.customerEmail === user?.email
    );
    
    // Check if any orders have been updated
    userOrders.forEach(order => {
      const existingOrder = orders.find(o => o._id === order._id);
      if (existingOrder && existingOrder.status !== order.status) {
        // Order status changed, show notification
        showOrderStatusNotification(order);
        setOrders(prev => prev.map(o => o._id === order._id ? order : o));
      }
    });
  };

  const showOrderStatusNotification = (order) => {
    const message = `Order #${order.orderNumber} status updated to: ${order.status}`;
    toast.success(message, {
      duration: 5000,
      icon: '📦'
    });
    
    // Add to notifications list
    setNotifications(prev => [{
      id: Date.now(),
      message,
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      timestamp: new Date()
    }, ...prev.slice(0, 4)]); // Keep only 5 most recent
  };

  const fetchOrders = async () => {
    try {
      // Get orders from localStorage
      const storedOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
      
      // Filter for current user's orders
      const userOrders = storedOrders.filter(order => 
        order.customerEmail === user?.email
      );
      
      // If no orders, show empty state
      setOrders(userOrders);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      preparing: 'status-preparing',
      ready: 'status-ready',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return colors[status] || 'status-pending';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: Package,
      preparing: Clock,
      ready: Package,
      completed: Package,
      cancelled: Clock
    };
    return icons[status] || Clock;
  };

  const formatPickupTime = (slot) => {
    if (!slot) return 'Not scheduled';
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.foodTruck.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">Track and manage your food orders</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or truck name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-600" />
              Recent Notifications
            </h3>
            <button
              onClick={() => setNotifications([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600">📦</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/orders/${notification.orderId}`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View Order
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No orders found' : 'No orders yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'Try adjusting your search or filters' : 'Start by ordering from your favorite food trucks'}
          </p>
          {!searchTerm && (
            <Link to="/trucks" className="btn btn-primary">
              Browse Food Trucks
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <div key={order._id} className={`order-card ${order.status}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                        <StatusIcon className="h-3 w-3 inline mr-1" />
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="text-gray-600 mb-2">
                      <Link to={`/trucks/${order.foodTruck._id}`} className="hover:text-blue-600">
                        {order.foodTruck.name}
                      </Link>
                      {' • '}
                      {order.foodTruck.location}
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-3">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Pickup: {formatPickupTime(order.pickupSlot)}</span>
                      </div>
                      <div className="font-semibold" style={{ color: '#7d0c0c' }}>
                        Total: EGP {order.totalAmount.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-600">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} • 
                      {order.items.reduce((total, item) => total + item.quantity, 0)} total items
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <Link
                      to={`/orders/${order._id}`}
                      className="btn btn-primary flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
