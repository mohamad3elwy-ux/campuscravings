import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, ArrowLeft, Package, Star, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview] = useState({ rating: 5, review: '' });

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  useEffect(() => {
    if (order && order.status === 'ready') {
      const interval = setInterval(() => {
        calculateTimeRemaining();
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      // Get orders from localStorage
      const storedOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
      
      // Find the specific order by ID
      const foundOrder = storedOrders.find(order => order._id === id);
      
      if (foundOrder) {
        // Check if this order belongs to the current user (for students)
        if (user?.role === 'student' && foundOrder.customerEmail !== user.email) {
          toast.error('Order not found');
          navigate('/orders');
          return;
        }
        
        setOrder(foundOrder);
      } else {
        toast.error('Order not found');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeRemaining = () => {
    if (!order?.pickupSlot?.endTime) return;
    
    const now = new Date();
    const endTime = new Date(order.pickupSlot.endTime);
    const remaining = endTime - now;
    
    if (remaining > 0) {
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    } else {
      setTimeRemaining('Expired');
    }
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

  const formatPickupTime = (slot) => {
    if (!slot) return 'Not scheduled';
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const submitReview = async () => {
    try {
      // MOCK REVIEW SUBMISSION
      console.log('MOCK REVIEW SUBMISSION:', {
        orderId: id,
        rating: review.rating,
        review: review.review
      });
      
      // Get orders from localStorage
      const storedOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
      
      // Find and update the order with review
      const updatedOrders = storedOrders.map(order => {
        if (order._id === id) {
          return {
            ...order,
            review: {
              rating: review.rating,
              review: review.review,
              submittedAt: new Date().toISOString()
            },
            status: 'completed' // Mark as completed after review
          };
        }
        return order;
      });
      
      // Save updated orders
      localStorage.setItem('mockOrders', JSON.stringify(updatedOrders));
      
      // Update local state
      const updatedOrder = updatedOrders.find(order => order._id === id);
      setOrder(updatedOrder);
      
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      
      console.log('REVIEW SUBMITTED SUCCESSFULLY');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Order not found
        </h3>
        <button
          onClick={() => navigate('/orders')}
          className="btn btn-primary"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center text-gray-600 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h1>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <div className="text-sm opacity-90">
                  Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
            {order.status === 'ready' && timeRemaining && (
              <div className="text-center">
                <div className="text-sm opacity-90 mb-1">Pickup in</div>
                <div className="countdown-timer bg-white text-blue-600">
                  {timeRemaining}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Order Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Package className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">{order.foodTruck.name}</div>
                    <div className="text-sm">{order.foodTruck.location}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">Pickup Time</div>
                    <div className="text-sm">{formatPickupTime(order.pickupSlot)}</div>
                  </div>
                </div>
                
                {order.specialInstructions && (
                  <div>
                    <div className="font-medium text-gray-900 mb-2">Special Instructions</div>
                    <div className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                      {order.specialInstructions}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Items Ordered</h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <div className="font-medium">{item.menuItem.name}</div>
                      {item.specialInstructions && (
                        <div className="text-sm text-gray-600 mt-1">
                          Note: {item.specialInstructions}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">EGP {item.price.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">x{item.quantity}</div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span style={{ color: '#7d0c0c' }}>EGP {order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {order.status === 'completed' && !order.review && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Rate Your Experience</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="btn btn-primary flex items-center"
                >
                  <Star className="h-5 w-5 mr-2" />
                  Leave a Review
                </button>
              </div>
            </div>
          )}

          {order.review && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Your Review</h3>
              <div className="flex items-center space-x-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < order.review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-gray-600">({order.review.rating}/5)</span>
              </div>
              {order.review.review && (
                <p className="text-gray-600">{order.review.review}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Submitted on {new Date(order.review.submittedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Rate Your Order</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReview({ ...review, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'} hover:text-yellow-400`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review (optional)
              </label>
              <textarea
                value={review.review}
                onChange={(e) => setReview({ ...review, review: e.target.value })}
                rows="4"
                className="input"
                placeholder="Share your experience with this order..."
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowReviewForm(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="btn btn-primary flex-1"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
