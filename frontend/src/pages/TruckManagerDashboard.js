import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Star, Clock, DollarSign, Users, TrendingUp, Package, Camera, X, Eye, Truck, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const TruckManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myTrucks, setMyTrucks] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showAddTruckModal, setShowAddTruckModal] = useState(false);
  const [showEditTruckModal, setShowEditTruckModal] = useState(false);
  const [showAddMenuItemModal, setShowAddMenuItemModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [newTruck, setNewTruck] = useState({
    name: '',
    location: '',
    description: '',
    operatingHours: { open: '08:00', close: '20:00' },
    coverPicture: null
  });
  const [coverPicturePreview, setCoverPicturePreview] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main',
    ingredients: '',
    allergens: '',
    preparationTime: 15
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgPrepTime: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCoverPictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Cover picture must be less than 10MB');
        return;
      }
      setNewTruck({ ...newTruck, coverPicture: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Profile picture must be less than 10MB');
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfilePicture = async () => {
    try {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Update user with profile picture
      const updatedUser = {
        ...currentUser,
        profilePicture: profilePicturePreview
      };
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update all users in mockUsers
      const allUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const updatedUsers = allUsers.map(u => 
        u._id === currentUser._id ? updatedUser : u
      );
      localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
      
      toast.success('Profile picture updated successfully!');
      setProfilePicture(null);
      setProfilePicturePreview(null);
      
    } catch (error) {
      console.error('Error saving profile picture:', error);
      toast.error('Failed to save profile picture');
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Get trucks from localStorage (created by managers)
      const storedTrucks = JSON.parse(localStorage.getItem('mockTrucks') || '[]');
      
      // Get orders from localStorage (placed by students)
      const storedOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
      
      console.log('🔍 MANAGER DASHBOARD - ORDER FILTERING DEBUG:');
      console.log('📦 All orders in storage:', storedOrders.length);
      console.log('👤 Manager ID:', user._id);
      console.log('🚚 Manager trucks:', storedTrucks.map(t => ({_id: t._id, name: t.name, manager: t.manager})));
      
      // Filter orders for this manager's trucks
      const managerOrders = storedOrders.filter(order => {
        const belongsToManager = storedTrucks.some(truck => 
          truck._id === order.foodTruck?._id && truck.manager === user._id
        );
        
        console.log(`🔍 Order ${order.orderNumber}:`, {
          foodTruckId: order.foodTruck?._id,
          foodTruckName: order.foodTruckName,
          belongsToManager,
          truckMatch: storedTrucks.find(t => t._id === order.foodTruck?._id)
        });
        
        return belongsToManager;
      });
      
      console.log('✅ Filtered manager orders:', managerOrders.length);
      managerOrders.forEach(order => {
        console.log(`✅ Order #${order.orderNumber} for ${order.foodTruckName}`);
      });
      
      // Get menu items from localStorage
      const storedMenuItems = JSON.parse(localStorage.getItem('mockMenuItems') || '[]');
      
      // Calculate stats from real data
      const totalOrders = managerOrders.length;
      const totalRevenue = managerOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const pendingOrders = managerOrders.filter(order => order.status === 'pending').length;
      const avgPrepTime = 15; // Default prep time
      
      const stats = {
        totalOrders,
        totalRevenue,
        avgPrepTime,
        pendingOrders
      };
      
      console.log('MANAGER DASHBOARD DATA:', {
        trucks: storedTrucks,
        orders: managerOrders,
        menuItems: storedMenuItems,
        stats
      });
      
      setMyTrucks(storedTrucks);
      setRecentOrders(managerOrders);
      setMenuItems(storedMenuItems);
      setStats(stats);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const deleteTruck = async (truckId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this truck? This action cannot be undone.')) {
        return;
      }

      // Get existing trucks from localStorage
      const existingTrucks = JSON.parse(localStorage.getItem('mockTrucks') || '[]');
      
      // Remove the truck
      const updatedTrucks = existingTrucks.filter(truck => truck._id !== truckId);
      
      // Save to localStorage
      localStorage.setItem('mockTrucks', JSON.stringify(updatedTrucks));
      
      // Also remove associated menu items
      const existingMenuItems = JSON.parse(localStorage.getItem('mockMenuItems') || '[]');
      const updatedMenuItems = existingMenuItems.filter(item => item.truckId !== truckId);
      localStorage.setItem('mockMenuItems', JSON.stringify(updatedMenuItems));
      
      // Refresh dashboard data
      fetchDashboardData();
      
      toast.success('Truck deleted successfully!');
      console.log('TRUCK DELETED:', truckId);
      
    } catch (error) {
      console.error('Error deleting truck:', error);
      toast.error('Failed to delete truck');
    }
  };

  const addTruck = async () => {
    try {
      if (!newTruck.name || !newTruck.location) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Generate unique ID
      const truckId = `user_truck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Handle cover picture (convert to base64 if exists)
      let coverPictureData = null;
      if (newTruck.coverPicture) {
        coverPictureData = coverPicturePreview;
      }
      
      const truckData = {
        _id: truckId,
        name: newTruck.name,
        location: newTruck.location,
        description: newTruck.description,
        operatingHours: newTruck.operatingHours,
        coverPicture: coverPictureData,
        currentQueueTime: 15,
        rating: 0,
        ratingCount: 0,
        isActive: false, // Inactive until admin approval
        isApproved: false, // Needs admin approval
        manager: user._id,
        createdAt: new Date().toISOString()
      };
      
      console.log('ADDING NEW TRUCK:', truckData);
      console.log('📝 TRUCK DETAILS:', {
        name: truckData.name,
        isApproved: truckData.isApproved,
        isRejected: truckData.isRejected,
        manager: truckData.manager,
        createdAt: truckData.createdAt
      });
      
      // Get existing trucks from localStorage
      const existingTrucks = JSON.parse(localStorage.getItem('mockTrucks') || '[]');
      
      // Add new truck
      existingTrucks.push(truckData);
      
      // Save to localStorage
      localStorage.setItem('mockTrucks', JSON.stringify(existingTrucks));
      
      // Refresh dashboard data
      fetchDashboardData();
      
      // Reset form and close modal
      setNewTruck({
        name: '',
        location: '',
        description: '',
        operatingHours: { open: '08:00', close: '20:00' },
        coverPicture: null
      });
      setCoverPicturePreview(null);
      setShowAddTruckModal(false);
      
      toast.success('Truck added successfully!');
      console.log('TRUCK ADDED SUCCESSFULLY');
      
    } catch (error) {
      console.error('Error adding truck:', error);
      toast.error('Failed to add truck');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    // Mock update order status
    toast.success(`Order status updated to ${newStatus} (mock)`);
    fetchDashboardData();
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

  const handleEditTruck = async () => {
    // Mock edit truck functionality
    toast.success('Truck updated successfully (mock)');
    setShowEditTruckModal(false);
    setSelectedTruck(null);
    fetchDashboardData();
  };

  const handleAddMenuItem = async () => {
    try {
      // Create new menu item object
      const menuItemData = {
        _id: 'menu-item-' + Date.now(),
        name: newMenuItem.name,
        description: newMenuItem.description,
        price: parseFloat(newMenuItem.price),
        category: newMenuItem.category,
        ingredients: newMenuItem.ingredients,
        allergens: newMenuItem.allergens,
        preparationTime: parseInt(newMenuItem.preparationTime),
        isAvailable: true,
        truckId: selectedTruck?._id,
        createdAt: new Date().toISOString()
      };
      
      console.log('ADDING NEW MENU ITEM:', menuItemData);
      
      // Get existing menu items from localStorage
      const existingMenuItems = JSON.parse(localStorage.getItem('mockMenuItems') || '[]');
      
      // Add new menu item
      existingMenuItems.push(menuItemData);
      
      // Save to localStorage
      localStorage.setItem('mockMenuItems', JSON.stringify(existingMenuItems));
      
      // Refresh dashboard data
      fetchDashboardData();
      
      // Reset form and close modal
      setNewMenuItem({
        name: '',
        description: '',
        price: '',
        category: 'Main',
        ingredients: '',
        allergens: '',
        preparationTime: 15
      });
      setShowAddMenuItemModal(false);
      
      toast.success('Menu item added successfully!');
      console.log('MENU ITEM ADDED SUCCESSFULLY');
      
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
    }
  };

  const openEditTruckModal = (truck) => {
    setSelectedTruck(truck);
    setShowEditTruckModal(true);
  };

  const openAddMenuItemModal = (truck) => {
    setSelectedTruck(truck);
    setShowAddMenuItemModal(true);
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Truck Manager Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your food truck and orders</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-red-600 to-red-800">
              <Truck className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{myTrucks.length}</div>
          <div className="text-gray-600 text-sm">My Trucks</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-red-600 to-red-800">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="text-sm font-medium text-red-600">
              {stats.pendingOrders} pending
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
          <div className="text-gray-600 text-sm">Total Orders</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-red-600 to-red-800">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">EGP {stats.totalRevenue.toFixed(2)}</div>
          <div className="text-gray-600 text-sm">Total Revenue</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-red-600 to-red-800">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.avgPrepTime} min</div>
          <div className="text-gray-600 text-sm">Avg. Prep Time</div>
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Manager Profile</h2>
        <div className="flex items-center space-x-6">
          <div className="relative">
            {user?.profilePicture || profilePicturePreview ? (
              <img 
                src={profilePicturePreview || user.profilePicture} 
                alt="Manager Profile" 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-1">Truck Manager</p>
          </div>
          <div>
            <label className="btn bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg cursor-pointer flex items-center">
              <Camera className="h-4 w-4 mr-2" />
              Update Profile Picture
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </label>
            {profilePicturePreview && (
              <div className="mt-2 space-x-2">
                <button
                  onClick={saveProfilePicture}
                  className="btn btn-primary text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setProfilePicture(null);
                    setProfilePicturePreview(null);
                  }}
                  className="btn btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Food Trucks</h2>
            <button 
              onClick={() => setShowAddTruckModal(true)}
              className="btn btn-primary flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Truck
            </button>
          </div>
          
          {myTrucks.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 mx-auto mb-4 bg-gradient-to-r from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trucks yet</h3>
              <p className="text-gray-600 mb-4">Add your first food truck to get started</p>
              <button 
                onClick={() => setShowAddTruckModal(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Truck
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myTrucks.map((truck) => (
                <div key={truck._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{truck.name}</h3>
                      <p className="text-gray-600">{truck.location}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className={`${
                          truck.isApproved === true ? 'text-green-600' : 
                          truck.isRejected === true ? 'text-red-600' : 
                          'text-yellow-600'
                        }`}>
                          {truck.isApproved === true ? 'Approved' : 
                           truck.isRejected === true ? 'Rejected' : 
                           'Pending'}
                        </span>
                        <span>Rating: {truck.rating?.toFixed(1) || 'New'}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditTruckModal(truck)}
                        className="p-2 text-gray-600 hover:text-red-600"
                        title="Edit Truck"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openAddMenuItemModal(truck)}
                        className="p-2 text-gray-600 hover:text-red-600"
                        title="Add Menu Item"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTruck(truck._id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                        title="Delete Truck"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/trucks/${truck._id}`}
                        className="p-2 text-gray-600 hover:text-red-600"
                        title="View Truck"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Link to="/manager/orders" className="text-red-600 hover:text-red-700 text-sm">
              View All
            </Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 mx-auto mb-4 bg-gradient-to-r from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">Orders will appear here when customers place them</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                      <p className="text-gray-600 text-sm">
                        {order.user?.name} • {order.items.length} items
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Total: <span className="font-semibold text-gray-900">EGP {order.totalAmount.toFixed(2)}</span>
                    </div>
                    
                    {order.status === 'pending' && (
                      <div className="flex space-x-2">
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
                      </div>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Menu Items Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Menu Items</h2>
            <span className="text-sm text-gray-600">
              {menuItems.length} items
            </span>
          </div>
          
          {menuItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 mx-auto mb-4 bg-gradient-to-r from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items yet</h3>
              <p className="text-gray-600 mb-4">Add your first menu item to get started</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {menuItems.map((item) => (
                <div key={item._id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-gray-600 text-xs mb-1">{item.description}</p>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="font-bold" style={{ color: '#7d0c0c' }}>
                          EGP {item.price.toFixed(2)}
                        </span>
                        <span className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                          {item.category}
                        </span>
                        <span className="text-gray-600">
                          {item.preparationTime}m
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-1 text-gray-600 hover:text-red-600" title="Edit Item">
                        <Edit className="h-3 w-3" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-red-600" title="Remove Item">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Truck Modal */}
      {showAddTruckModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New Food Truck</h3>
              <button
                onClick={() => {
                  console.log('Closing add truck modal');
                  setShowAddTruckModal(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Truck Name
                </label>
                <input
                  type="text"
                  value={newTruck.name}
                  onChange={(e) => {
                    console.log('Truck name changed:', e.target.value);
                    setNewTruck({...newTruck, name: e.target.value});
                  }}
                  className="input"
                  placeholder="Enter truck name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newTruck.location}
                  onChange={(e) => setNewTruck({...newTruck, location: e.target.value})}
                  className="input"
                  placeholder="Enter location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTruck.description}
                  onChange={(e) => setNewTruck({...newTruck, description: e.target.value})}
                  className="input"
                  rows="3"
                  placeholder="Describe your food truck"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Picture (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  {coverPicturePreview ? (
                    <div className="relative">
                      <img 
                        src={coverPicturePreview} 
                        alt="Cover preview" 
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setCoverPicturePreview(null);
                          setNewTruck({...newTruck, coverPicture: null});
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div>
                    <label className="btn bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg cursor-pointer flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Cover Picture
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverPictureChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Max 10MB, JPG/PNG</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={newTruck.operatingHours.open}
                    onChange={(e) => setNewTruck({
                      ...newTruck, 
                      operatingHours: {...newTruck.operatingHours, open: e.target.value}
                    })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={newTruck.operatingHours.close}
                    onChange={(e) => setNewTruck({
                      ...newTruck, 
                      operatingHours: {...newTruck.operatingHours, close: e.target.value}
                    })}
                    className="input"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  console.log('Cancel clicked');
                  setShowAddTruckModal(false);
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Add truck clicked, newTruck:', newTruck);
                  try {
                    addTruck();
                  } catch (error) {
                    console.error('Error adding truck:', error);
                  }
                }}
                className="btn btn-primary flex-1"
                disabled={!newTruck.name || !newTruck.location}
              >
                Add Truck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Truck Modal */}
      {showEditTruckModal && selectedTruck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Food Truck</h3>
              <button
                onClick={() => setShowEditTruckModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Truck Name
                </label>
                <input
                  type="text"
                  value={selectedTruck.name}
                  onChange={(e) => setSelectedTruck({...selectedTruck, name: e.target.value})}
                  className="input"
                  placeholder="Enter truck name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={selectedTruck.location}
                  onChange={(e) => setSelectedTruck({...selectedTruck, location: e.target.value})}
                  className="input"
                  placeholder="Enter location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={selectedTruck.description}
                  onChange={(e) => setSelectedTruck({...selectedTruck, description: e.target.value})}
                  className="input"
                  rows="3"
                  placeholder="Describe your food truck"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={selectedTruck.operatingHours?.open || '08:00'}
                    onChange={(e) => setSelectedTruck({
                      ...selectedTruck, 
                      operatingHours: {...selectedTruck.operatingHours, open: e.target.value}
                    })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={selectedTruck.operatingHours?.close || '20:00'}
                    onChange={(e) => setSelectedTruck({
                      ...selectedTruck, 
                      operatingHours: {...selectedTruck.operatingHours, close: e.target.value}
                    })}
                    className="input"
                  />
                </div>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTruck.isActive}
                    onChange={(e) => setSelectedTruck({...selectedTruck, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditTruckModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleEditTruck}
                className="btn btn-primary flex-1"
                disabled={!selectedTruck.name || !selectedTruck.location}
              >
                Update Truck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showAddMenuItemModal && selectedTruck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Menu Item to {selectedTruck.name}</h3>
              <button
                onClick={() => setShowAddMenuItemModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                  className="input"
                  placeholder="Enter item name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newMenuItem.description}
                  onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                  className="input"
                  rows="2"
                  placeholder="Describe the menu item"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (EGP)
                </label>
                <input
                  type="number"
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
                  className="input"
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newMenuItem.category}
                  onChange={(e) => setNewMenuItem({...newMenuItem, category: e.target.value})}
                  className="input"
                >
                  <option value="Main">Main Course</option>
                  <option value="Appetizer">Appetizer</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preparation Time (minutes)
                </label>
                <input
                  type="number"
                  value={newMenuItem.preparationTime}
                  onChange={(e) => setNewMenuItem({...newMenuItem, preparationTime: parseInt(e.target.value)})}
                  className="input"
                  min="1"
                  max="60"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredients (comma-separated)
                </label>
                <input
                  type="text"
                  value={newMenuItem.ingredients}
                  onChange={(e) => setNewMenuItem({...newMenuItem, ingredients: e.target.value})}
                  className="input"
                  placeholder="e.g., chicken, rice, vegetables"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergens (comma-separated)
                </label>
                <input
                  type="text"
                  value={newMenuItem.allergens}
                  onChange={(e) => setNewMenuItem({...newMenuItem, allergens: e.target.value})}
                  className="input"
                  placeholder="e.g., nuts, dairy, gluten"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddMenuItemModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMenuItem}
                className="btn btn-primary flex-1"
                disabled={!newMenuItem.name || !newMenuItem.price}
              >
                Add Menu Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckManagerDashboard;
