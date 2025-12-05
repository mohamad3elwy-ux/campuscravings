import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Star, ArrowLeft, Plus, Minus, ShoppingCart, Info } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { mockFoodTrucks, mockMenuItems } from '../services/mockData';

const TruckDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [truck, setTruck] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const cartRef = useRef({});
  const buttonClickTimeout = useRef({});

  useEffect(() => {
    fetchTruckDetails();
  }, [id]);

  // Sync ref with React state
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(buttonClickTimeout.current).forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

  const fetchTruckDetails = async () => {
    try {
      // Only get real trucks from localStorage (created by managers)
      const storedTrucks = JSON.parse(localStorage.getItem('mockTrucks') || '[]');
      
      console.log('FETCHING TRUCK DETAILS FOR ID:', id);
      console.log('STORED TRUCKS:', storedTrucks);
      
      // Find the truck from real trucks only
      const foundTruck = storedTrucks.find(truck => 
        truck._id === id && !truck._id.startsWith('truck')
      );
      
      // Get menu items for this truck from localStorage
      const storedMenuItems = JSON.parse(localStorage.getItem('mockMenuItems') || '[]');
      const truckMenuItems = storedMenuItems.filter(item => item.truckId === id);
      
      console.log('FOUND TRUCK:', foundTruck);
      console.log('TRUCK MENU ITEMS:', truckMenuItems);
      
      if (!foundTruck) {
        console.error('Truck not found:', id);
        setLoading(false);
        return;
      }
      
      setTruck(foundTruck);
      setMenuItems(truckMenuItems);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching truck details:', error);
      setLoading(false);
    }
  };

  const updateQuantity = useCallback((itemId, change) => {
    // Prevent multiple rapid clicks
    if (buttonClickTimeout.current[itemId]) {
      console.log('Click throttled for itemId:', itemId);
      return;
    }
    
    console.log(`updateQuantity called: itemId=${itemId}, change=${change}`);
    
    // Use ref for immediate state update
    const currentCart = cartRef.current;
    console.log('Current cart (ref):', currentCart);
    
    const newCart = { ...currentCart };
    const currentQuantity = newCart[itemId]?.quantity || 0;
    
    console.log(`Current quantity: ${currentQuantity}`);
    
    if (change > 0) {
      // Adding item
      if (newCart[itemId]) {
        newCart[itemId].quantity = currentQuantity + 1;
      } else {
        const item = menuItems.find(i => i._id === itemId);
        if (item) {
          newCart[itemId] = {
            ...item,
            quantity: 1
          };
        }
      }
    } else {
      // Removing item
      if (newCart[itemId]) {
        const newQuantity = currentQuantity - 1;
        if (newQuantity <= 0) {
          delete newCart[itemId];
        } else {
          newCart[itemId].quantity = newQuantity;
        }
      }
    }
    
    // Update ref immediately
    cartRef.current = newCart;
    console.log('New cart (ref):', newCart);
    
    // Update React state
    setCart(newCart);
    
    // Set timeout to prevent double-clicks
    buttonClickTimeout.current[itemId] = true;
    setTimeout(() => {
      delete buttonClickTimeout.current[itemId];
    }, 300);
  }, [menuItems]);

  const getCartTotal = () => {
    return Object.values(cart).reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getCartItems = () => {
    return Object.values(cart);
  };

  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const cairoNow = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
    
    // Generate pickup slots every 15 minutes from 8:00 AM to 5:00 PM
    const startHour = 8;
    const endHour = 17; // 5:00 PM
    
    // Check if current time is after all slots, then show tomorrow's slots
    const lastSlotEnd = new Date(cairoNow);
    lastSlotEnd.setHours(17, 0, 0, 0);
    
    const useTomorrow = cairoNow > lastSlotEnd;
    const baseDate = useTomorrow ? new Date(cairoNow.getTime() + 24 * 60 * 60 * 1000) : cairoNow;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const startTime = new Date(baseDate);
        startTime.setHours(hour, minute, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 15);
        
        // Include all slots for today, or tomorrow's slots if today are past
        if (!useTomorrow || startTime > cairoNow) {
          const startLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const endLabel = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
          
          const dayLabel = useTomorrow ? 'Tomorrow ' : '';
          
          slots.push({
            startTime,
            endTime,
            label: `${dayLabel}${startLabel} - ${endLabel}`
          });
        }
      }
    }
    
    return slots;
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }
    
    if (getCartItems().length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    setShowCheckout(true);
  };

  const placeOrder = async () => {
    if (!selectedSlot) {
      toast.error('Please select a pickup time slot');
      return;
    }
    
    try {
      // MOCK ORDER PLACEMENT
      const orderData = {
        _id: 'order-' + Date.now(),
        orderNumber: 'ORD-' + Math.floor(Math.random() * 10000),
        foodTruck: {
          _id: id,
          name: truck?.name || 'Food Truck'
        },
        foodTruckName: truck?.name || 'Food Truck',
        items: getCartItems().map(item => ({
          menuItem: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions || ''
        })),
        totalAmount: getCartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0),
        pickupSlot: {
          startTime: selectedSlot.startTime.toISOString(),
          endTime: selectedSlot.endTime.toISOString()
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        customerName: user?.name || 'Student',
        customerEmail: user?.email || 'student@campus.edu'
      };
      
      console.log('MOCK ORDER PLACED:', orderData);
      
      // Show success message
      toast.success(`Order placed successfully! Order #${orderData.orderNumber}`);
      
      // Store in localStorage for manager/admin to see
      const existingOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('mockOrders', JSON.stringify(existingOrders));
      
      // Clear cart and close checkout
      setCart({});
      setShowCheckout(false);
      setSelectedSlot(null);
      
      // Navigate to order detail page
      navigate(`/orders/${orderData._id}`);
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Food truck not found
        </h3>
        <button
          onClick={() => navigate('/trucks')}
          className="btn btn-primary"
        >
          Back to Trucks
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate('/trucks')}
        className="flex items-center text-gray-600 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Food Trucks
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-64 overflow-hidden bg-gradient-to-br from-red-600 to-red-800 relative">
          {truck.coverPicture ? (
            <img 
              src={truck.coverPicture} 
              alt={truck.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hide image and show gradient fallback
                e.target.style.display = 'none';
                const fallback = e.target.parentElement.querySelector('.image-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="image-fallback absolute inset-0 flex items-center justify-center" style={{ display: truck.coverPicture ? 'none' : 'flex' }}>
            <div className="text-white text-center">
              <div className="text-4xl mb-2">🍔</div>
              <div className="text-2xl font-bold">{truck.name}</div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{truck.name}</h1>
            {truck.isActive && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Open Now
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-6 mb-6">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{truck.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <span>{truck.rating ? truck.rating.toFixed(1) : 'New'} ({truck.ratingCount || 0} reviews)</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-2" />
              <span>{truck.currentQueueTime || 15} min avg. prep time</span>
            </div>
          </div>
          
          {truck.description && (
            <p className="text-gray-600 mb-6">{truck.description}</p>
          )}
          
          <div className="text-sm text-gray-500">
            Operating Hours: {truck.operatingHours?.open || '08:00'} - {truck.operatingHours?.close || '20:00'}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Menu</h2>
        
        {menuItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No menu items available
            </h3>
            <p className="text-gray-600">
              This truck hasn't added any menu items yet
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {menuItems.map((item) => (
              <div key={item._id} className="menu-item-card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">{item.category}</span>
                      <span>{item.preparationTime} min</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold" style={{ color: '#7d0c0c' }}>
                      EGP {item.price.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateQuantity(item._id, -1);
                      }}
                      className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      style={{ 
                        width: '32px',
                        height: '32px'
                      }}
                      disabled={!cart[item._id]}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">
                      {cart[item._id]?.quantity || 0}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateQuantity(item._id, 1);
                      }}
                      className="p-1 rounded-full text-white transition-all duration-200 hover:scale-110 flex items-center justify-center"
                      style={{ 
                        backgroundColor: '#7d0c0c',
                        width: '32px',
                        height: '32px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#9a0f0f'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#7d0c0c'}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {item.ingredients && item.ingredients.length > 0 && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <Info className="h-4 w-4 mr-1" />
                      <span>{item.ingredients.length} ingredients</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {getCartItems().length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4 z-40 md:relative md:border-0 md:shadow-none md:p-0 md:mt-8 transform transition-all duration-300">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                {getCartItems().reduce((total, item) => total + item.quantity, 0)}
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium">
                  Cart Total
                </div>
                <div className="text-2xl font-bold" style={{ color: '#7d0c0c' }}>
                  EGP {getCartTotal().toFixed(2)}
                </div>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="btn btn-primary flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Checkout
            </button>
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Checkout</h3>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Order Summary</h4>
              {getCartItems().map((item, index) => (
                <div key={index} className="flex justify-between py-2">
                  <span>{item.quantity}x {item.name}</span>
                  <span>EGP {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span style={{ color: '#7d0c0c' }}>EGP {getCartTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Select Pickup Time Slot</h4>
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {generateTimeSlots().map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedSlot === slot
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{slot.label}</div>
                    <div className="text-sm text-gray-600">15-minute slot</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={placeOrder}
                disabled={!selectedSlot}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckDetail;
