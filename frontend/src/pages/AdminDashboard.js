import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, ShoppingCart, DollarSign, Truck, Check, X, Eye, Star, Package, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrucks: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgRating: 0
  });
  const [pendingTrucks, setPendingTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetchPendingTrucks();
  }, []);

  const fetchPendingTrucks = async () => {
    try {
      // Get trucks from localStorage
      const storedTrucks = JSON.parse(localStorage.getItem('mockTrucks') || '[]');
      
      console.log('🔍 ALL TRUCKS IN STORAGE:', storedTrucks.map(t => ({
        name: t.name, 
        isApproved: t.isApproved, 
        isRejected: t.isRejected,
        isActive: t.isActive,
        _id: t._id
      })));
      
      // Filter trucks that need approval (isApproved is false or undefined, but not explicitly rejected)
      const pending = storedTrucks.filter(truck => {
        const shouldInclude = 
          truck._id && 
          truck.name && 
          !truck._id.startsWith('truck') && // Filter out demo trucks that start with 'truck'
          (truck.isApproved === false || truck.isApproved === undefined) &&
          !truck.isRejected; // Explicitly check if not rejected
        
        console.log(`🔍 Truck "${truck.name}":`, {
          hasId: !!truck._id,
          hasName: !!truck.name,
          isRealTruck: !truck._id?.startsWith('truck'), // User trucks start with 'user_truck'
          isApproved: truck.isApproved,
          isRejected: truck.isRejected,
          shouldInclude
        });
        
        return shouldInclude;
      });
      
      console.log('📋 PENDING TRUCKS FOR APPROVAL:', pending);
      console.log('📊 PENDING TRUCKS COUNT:', pending.length);
      setPendingTrucks(pending);
      
    } catch (error) {
      console.error('Error fetching pending trucks:', error);
    }
  };

  const fetchDashboardStats = async () => {
    // MOCK DATA - No API calls needed
    const mockStats = {
      totalUsers: 150,
      totalTrucks: 8,
      totalOrders: 1250,
      totalRevenue: 15678.50,
      avgRating: 4.7
    };
    
    setStats(mockStats);
    setLoading(false);
  };

  const deleteTruck = async (truckId) => {
    try {
      console.log('🗑️ ADMIN DELETE TRUCK CLICKED:', truckId);
      
      if (!window.confirm('Are you sure you want to delete this truck? This action cannot be undone.')) {
        console.log('🚫 DELETE CANCELLED BY USER');
        return;
      }

      console.log('✅ DELETE CONFIRMED, PROCEEDING...');

      // Get existing trucks from localStorage
      const existingTrucks = JSON.parse(localStorage.getItem('mockTrucks') || '[]');
      console.log('📦 TRUCKS BEFORE DELETE:', existingTrucks.length);
      
      // Remove the truck
      const updatedTrucks = existingTrucks.filter(truck => truck._id !== truckId);
      console.log('📦 TRUCKS AFTER DELETE:', updatedTrucks.length);
      
      // Save to localStorage
      localStorage.setItem('mockTrucks', JSON.stringify(updatedTrucks));
      
      // Also remove associated menu items
      const existingMenuItems = JSON.parse(localStorage.getItem('mockMenuItems') || '[]');
      const updatedMenuItems = existingMenuItems.filter(item => item.truckId !== truckId);
      localStorage.setItem('mockMenuItems', JSON.stringify(updatedMenuItems));
      console.log('🗑️ MENU ITEMS DELETED:', existingMenuItems.length - updatedMenuItems.length);
      
      // Also remove associated orders
      const existingOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
      const updatedOrders = existingOrders.filter(order => order.foodTruck?._id !== truckId);
      localStorage.setItem('mockOrders', JSON.stringify(updatedOrders));
      console.log('🗑️ ORDERS DELETED:', existingOrders.length - updatedOrders.length);
      
      // Refresh pending trucks list
      fetchPendingTrucks();
      
      toast.success('Truck deleted successfully!');
      console.log('✅ TRUCK DELETED BY ADMIN:', truckId);
      
    } catch (error) {
      console.error('❌ ERROR DELETING TRUCK:', error);
      toast.error('Failed to delete truck');
    }
  };

  const approveTruck = async (truckId) => {
    try {
      // Get existing trucks from localStorage
      const existingTrucks = JSON.parse(localStorage.getItem('mockTrucks') || '[]');
      
      // Update the truck to be approved and active
      const updatedTrucks = existingTrucks.map(truck => 
        truck._id === truckId 
          ? { ...truck, isApproved: true, isActive: true }
          : truck
      );
      
      // Save to localStorage
      localStorage.setItem('mockTrucks', JSON.stringify(updatedTrucks));
      
      // Refresh pending trucks list
      fetchPendingTrucks();
      
      toast.success('Truck approved successfully!');
      console.log('TRUCK APPROVED:', truckId);
      
    } catch (error) {
      console.error('Error approving truck:', error);
      toast.error('Failed to approve truck');
    }
  };

  const rejectTruck = async (truckId) => {
    try {
      // Get existing trucks from localStorage
      const existingTrucks = JSON.parse(localStorage.getItem('mockTrucks') || '[]');
      
      // Update the truck to be rejected
      const updatedTrucks = existingTrucks.map(truck => 
        truck._id === truckId 
          ? { ...truck, isApproved: false, isActive: false, isRejected: true }
          : truck
      );
      
      // Save to localStorage
      localStorage.setItem('mockTrucks', JSON.stringify(updatedTrucks));
      
      // Refresh pending trucks list
      fetchPendingTrucks();
      
      toast.error('Truck rejected');
      console.log('TRUCK REJECTED:', truckId);
      
    } catch (error) {
      console.error('Error rejecting truck:', error);
      toast.error('Failed to reject truck');
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-gradient-to-r from-red-600 to-red-800',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Food Trucks',
      value: stats.totalTrucks,
      icon: Truck,
      color: 'bg-gradient-to-r from-red-600 to-red-800',
      change: '+2',
      changeType: 'positive'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: Package,
      color: 'bg-gradient-to-r from-red-600 to-red-800',
      change: '+25%',
      changeType: 'positive'
    },
    {
      title: 'Total Revenue',
      value: `EGP ${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-red-600 to-red-800',
      change: '+18%',
      changeType: 'positive'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your campus food truck system</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-gray-600 text-sm">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Truck Approval Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pending Truck Approvals</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchPendingTrucks}
              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
            >
              Refresh
            </button>
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              {pendingTrucks.length} pending
            </div>
          </div>
        </div>
        
        {pendingTrucks.length === 0 ? (
          <div className="text-center py-8">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending trucks</h3>
            <p className="text-gray-600">All trucks have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTrucks.map((truck) => (
              <div key={truck._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{truck.name}</h3>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        Pending Approval
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{truck.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Location:</span> {truck.location}
                      </div>
                      <div>
                        <span className="font-medium">Hours:</span> {truck.operatingHours?.open} - {truck.operatingHours?.close}
                      </div>
                      <div>
                        <span className="font-medium">Manager:</span> {truck.manager}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {new Date(truck.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {truck.coverPicture && (
                      <div className="mt-3">
                        <img 
                          src={truck.coverPicture} 
                          alt={`${truck.name} cover`} 
                          className="w-32 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => approveTruck(truck._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectTruck(truck._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                    <button
                      onClick={() => deleteTruck(truck._id)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b">
                <div>
                  <div className="font-medium">Order #ORD123{i}</div>
                  <div className="text-sm text-gray-600">Main Campus Grill</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">EGP {(15.99 * i).toFixed(2)}</div>
                  <div className="text-sm text-gray-600">2 min ago</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Popular Food Trucks</h2>
          <div className="space-y-4">
            {[
              { name: 'Main Campus Grill', orders: 45, rating: 4.8 },
              { name: 'Taco Tuesday', orders: 38, rating: 4.6 },
              { name: 'Pizza Express', orders: 32, rating: 4.7 },
              { name: 'Burger Barn', orders: 28, rating: 4.5 }
            ].map((truck, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b">
                <div>
                  <div className="font-medium">{truck.name}</div>
                  <div className="text-sm text-gray-600">{truck.orders} orders today</div>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{truck.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/trucks')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer w-full"
            style={{ borderColor: '#7d0c0c' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#9a0f0f';
              e.currentTarget.style.backgroundColor = 'rgba(125, 12, 12, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#7d0c0c';
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            <Users className="h-6 w-6 mb-2" style={{ color: '#7d0c0c' }} />
            <div className="font-medium">Manage Users</div>
            <div className="text-sm text-gray-600">View and manage user accounts</div>
          </button>
          <button 
            onClick={() => navigate('/trucks')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer w-full"
            style={{ borderColor: '#7d0c0c' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#9a0f0f';
              e.currentTarget.style.backgroundColor = 'rgba(125, 12, 12, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#7d0c0c';
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            <Truck className="h-6 w-6 mb-2" style={{ color: '#7d0c0c' }} />
            <div className="font-medium">Manage Trucks</div>
            <div className="text-sm text-gray-600">Add and configure food trucks</div>
          </button>
          <button 
            onClick={() => navigate('/orders')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer w-full"
            style={{ borderColor: '#7d0c0c' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#9a0f0f';
              e.currentTarget.style.backgroundColor = 'rgba(125, 12, 12, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#7d0c0c';
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            <Package className="h-6 w-6 mb-2" style={{ color: '#7d0c0c' }} />
            <div className="font-medium">View Orders</div>
            <div className="text-sm text-gray-600">Monitor all system orders</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
