import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, TrendingUp, Star, ArrowRight, Truck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Clock,
      title: '15-Minute Slots',
      description: 'Perfect for your short breaks between classes'
    },
    {
      icon: Users,
      title: 'Skip the Queue',
      description: 'Order ahead and pick up your food instantly'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Updates',
      description: 'Track your order status and estimated pickup time'
    },
    {
      icon: Star,
      title: 'Top Rated Trucks',
      description: 'Discover the best food trucks on campus'
    }
  ];

  const stats = [
    { number: '15+', label: 'Food Trucks' },
    { number: '500+', label: 'Daily Orders' },
    { number: '2min', label: 'Avg. Pickup Time' },
    { number: '4.8★', label: 'Customer Rating' }
  ];

  return (
    <div className="space-y-12">
      <section className="hero-gradient text-white py-20 px-4 rounded-2xl">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-german">
            Campus Cravings
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Order ahead, pick up fast — save your 15-minute break!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/trucks"
              className="btn bg-white px-8 py-3 text-lg font-semibold inline-flex items-center justify-center transition-transform duration-200 hover:scale-105"
              style={{ color: '#7d0c0c' }}
            >
              Browse Food Trucks
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            {!user && (
              <Link
                to="/register"
                className="btn bg-transparent border-2 border-white text-white hover:bg-white px-8 py-3 text-lg font-semibold transition-transform duration-200 hover:scale-105"
                style={{ '--hover-color': '#7d0c0c' }}
                onMouseEnter={(e) => e.target.style.color = '#7d0c0c'}
                onMouseLeave={(e) => e.target.style.color = 'white'}
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#7d0c0c' }}>
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Campus Cravings?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Designed specifically for university students with tight schedules
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(125, 12, 12, 0.1)' }}>
                  <feature.icon className="h-8 w-8" style={{ color: '#7d0c0c' }} />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 bg-gray-100 rounded-2xl px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 text-white rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: '#7d0c0c' }}>
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Browse Food Trucks</h3>
                  <p className="text-gray-600">Explore available trucks and their menus</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 text-white rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: '#7d0c0c' }}>
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Place Your Order</h3>
                  <p className="text-gray-600">Select items and choose your pickup time slot</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 text-white rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: '#7d0c0c' }}>
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Pick Up & Enjoy</h3>
                  <p className="text-gray-600">Collect your food instantly at your chosen time</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Truck className="h-32 w-32 mx-auto mb-4" style={{ color: '#7d0c0c' }} />
              <h3 className="text-xl font-semibold text-center mb-2">Ready to Get Started?</h3>
              <Link
                to="/trucks"
                className="btn btn-primary w-full"
              >
                Browse Food Trucks Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Join Thousands of Happy Students
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Experience the future of campus dining with smart ordering and instant pickup
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!user && (
            <Link
              to="/register"
              className="btn btn-primary px-8 py-3 text-lg font-semibold"
            >
              Sign Up Now
            </Link>
          )}
          <Link
            to="/trucks"
            className="btn btn-secondary px-8 py-3 text-lg font-semibold"
          >
            Browse Menu
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
