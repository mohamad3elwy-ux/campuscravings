import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Clock, TrendingUp, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ManagerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    // Get orders from localStorage (placed by students)
    const storedOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
    
    console.log('STORED ORDERS:', storedOrders);
    
    // Filter orders for this manager's trucks
    const managerOrders = storedOrders.filter(order => {
      // Get manager's trucks to check if order belongs to this manager
      const managerTrucks = JSON.parse(localStorage.getItem('mockTrucks') || '[]')
        .filter(truck => truck.manager === user?._id);
      
      const managerTruckIds = managerTrucks.map(truck => truck._id);
      
      // Show orders that belong to this manager's trucks
      return managerTruckIds.includes(order.truckId);
    });
    
    console.log('MANAGER ORDERS:', managerOrders);
    
    // Filter orders based on status
    let filteredOrders = managerOrders;
    if (filter !== 'all') {
      filteredOrders = managerOrders.filter(order => order.status === filter);
    }

    console.log('FINAL FILTERED ORDERS:', filteredOrders);
    setOrders(filteredOrders);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    // Mock update order status
    toast.success(`Order status updated to ${newStatus} (mock)`);
    
    // Update order status in localStorage
    const storedOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
    const updatedOrders = storedOrders.map(order => 
      order._id === orderId ? { ...order, status: newStatus } : order
    );
    localStorage.setItem('mockOrders', JSON.stringify(updatedOrders));
    
    fetchOrders();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Cairo'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Cairo'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/manager" 
            className="flex items-center text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
            <p className="text-gray-600">Manage and track all customer orders</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500">
              <Package className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
          <div className="text-gray-600 text-sm">Total Orders</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-yellow-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {orders.filter(o => o.status === 'pending').length}
          </div>
          <div className="text-gray-600 text-sm">Pending</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {orders.filter(o => o.status === 'preparing').length}
          </div>
          <div className="text-gray-600 text-sm">Preparing</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            EGP {orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
          </div>
          <div className="text-gray-600 text-sm">Total Revenue</div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Orders ({orders.length})</h2>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">No orders match the current filter</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order._id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                    <p className="text-gray-600">
                      {order.customerName} • {order.customerEmail}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.foodTruck.name} • {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="text-lg font-semibold mt-2">EGP {order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Items:</h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>EGP {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Pickup Time:</h4>
                  <p className="text-sm text-gray-600">
                    {formatTime(order.pickupSlot.startTime)} - {formatTime(order.pickupSlot.endTime)}
                  </p>
                </div>

                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order._id, 'confirmed')}
                        className="btn btn-primary text-xs"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order._id, 'cancelled')}
                        className="btn btn-secondary text-xs"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'preparing')}
                      className="btn btn-primary text-xs"
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'ready')}
                      className="btn btn-primary text-xs"
                    >
                      Mark Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'completed')}
                      className="btn btn-primary text-xs"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerOrders;
