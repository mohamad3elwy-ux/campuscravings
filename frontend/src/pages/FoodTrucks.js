import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Star, Filter, Search, Loader } from 'lucide-react';
import axios from 'axios';
import { mockFoodTrucks } from '../services/mockData';

const FoodTrucks = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      // Only get real trucks added by managers from localStorage
      const storedTrucks = JSON.parse(localStorage.getItem('mockTrucks') || '[]');
      
      console.log('FETCHING REAL TRUCKS:', storedTrucks);
      
      // Only show trucks that were actually added by managers AND approved by admin
      const realTrucks = storedTrucks.filter(truck => 
        truck._id && 
        truck.name && 
        !truck._id.startsWith('truck') && // Filter out demo trucks that start with 'truck'
        truck.isApproved === true // Only show explicitly approved trucks
      );
      
      console.log('🔍 TRUCK FILTERING DEBUG:');
      console.log('Total trucks in storage:', storedTrucks.length);
      console.log('Trucks with approval status:', storedTrucks.map(t => ({name: t.name, isApproved: t.isApproved})));
      console.log('Approved trucks to display:', realTrucks.length);
      realTrucks.forEach(truck => {
        console.log(`✅ ${truck.name} - Approved: ${truck.isApproved}`);
      });
      setTrucks(realTrucks);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching trucks:', error);
      setTrucks([]);
      setLoading(false);
    }
  };

  const filteredTrucks = trucks.filter(truck => {
    const matchesSearch = truck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         truck.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || true;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Sort based on selected category
    if (selectedCategory === 'popular') {
      // Sort by rating count (popularity)
      return (b.ratingCount || 0) - (a.ratingCount || 0);
    } else if (selectedCategory === 'quick') {
      // Sort by queue time (ascending - lower time first)
      return (a.currentQueueTime || 15) - (b.currentQueueTime || 15);
    } else if (selectedCategory === 'highly-rated') {
      // Sort by rating (descending - higher rating first)
      return (b.rating || 0) - (a.rating || 0);
    } else {
      // Default sort: active trucks first, then by rating
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return (b.rating || 0) - (a.rating || 0);
    }
  });

  const getAveragePrepTime = (truck) => {
    return truck.currentQueueTime || 15;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Food Trucks
        </h1>
        <p className="text-lg text-gray-600">
          Discover amazing food from trucks across campus
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trucks or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="all">All Trucks</option>
              <option value="popular">Popular</option>
              <option value="quick">Quick Service</option>
              <option value="highly-rated">Highly Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrucks.map((truck) => (
          <div key={truck._id} className="truck-card">
            <div className="relative">
              <div className="h-48 overflow-hidden bg-gradient-to-br from-red-600 to-red-800 relative">
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
                    <div className="text-lg font-semibold">{truck.name}</div>
                  </div>
                </div>
              </div>
              {truck.isActive && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  Open Now
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{truck.name}</h3>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{truck.location}</span>
              </div>
              
              {truck.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {truck.description}
                </p>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">
                      {truck.rating ? truck.rating.toFixed(1) : 'New'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{getAveragePrepTime(truck)} min</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {truck.ratingCount || 0} reviews
                </div>
                <Link
                  to={`/trucks/${truck._id}`}
                  className="btn btn-primary"
                >
                  View Menu
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTrucks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No food trucks found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default FoodTrucks;
