import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, User, Menu, X, LogOut, Truck, Home, Package } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`bg-white shadow-lg sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'shadow-xl' : ''
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className={`flex items-center transition-all duration-300 ${
            scrolled ? 'w-full justify-center' : 'justify-start space-x-2'
          }`}>
            <div className={`relative transition-all duration-300 ${
              scrolled ? 'group' : ''
            }`}>
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-red-600 to-red-800 shadow-2xl transition-all duration-300 ${
                scrolled ? 'scale-110 opacity-100' : 'scale-0 opacity-0'
              }`} />
              <img 
                src="/logo.png" 
                alt="Campus Cravings Logo" 
                className={`relative h-10 w-auto object-contain transition-all duration-300 cursor-pointer filter contrast-150 brightness-110 ${
                  scrolled ? 'h-12 drop-shadow-2xl' : 'h-10'
                }`}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
            <span className={`text-xl font-bold text-gray-800 font-german transition-all duration-300 ${
              scrolled ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
            }`}>
              Campus Cravings
            </span>
          </Link>

          <div className={`flex items-center transition-all duration-300 ${
            scrolled ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}>
            <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform ${
                isActiveLink('/') ? 'text-white font-bold scale-105' : 'text-gray-700 hover:scale-105'
              }`}
              style={isActiveLink('/') ? { 
                background: 'linear-gradient(135deg, #7d0c0c 0%, #9a0f0f 50%, #b81414 100%)',
                boxShadow: '0 2px 4px rgba(125, 12, 12, 0.3)',
                color: 'white !important'
              } : {}}
              onMouseEnter={(e) => {
                if (!isActiveLink('/')) {
                  e.target.style.color = '#7d0c0c';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActiveLink('/')) {
                  e.target.style.color = '';
                  e.target.style.transform = '';
                }
              }}
            >
              <Home className="h-4 w-4" style={{ color: isActiveLink('/') ? 'white' : 'inherit' }} />
              <span style={{ color: isActiveLink('/') ? 'white' : 'inherit' }}>Home</span>
            </Link>
            
            <Link
              to="/trucks"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform ${
                isActiveLink('/trucks') ? 'text-white font-bold scale-105' : 'text-gray-700 hover:scale-105'
              }`}
              style={isActiveLink('/trucks') ? { 
                background: 'linear-gradient(135deg, #7d0c0c 0%, #9a0f0f 50%, #b81414 100%)',
                boxShadow: '0 2px 4px rgba(125, 12, 12, 0.3)',
                color: 'white !important'
              } : {}}
              onMouseEnter={(e) => {
                if (!isActiveLink('/trucks')) {
                  e.target.style.color = '#7d0c0c';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActiveLink('/trucks')) {
                  e.target.style.color = '';
                  e.target.style.transform = '';
                }
              }}
            >
              <Truck className="h-4 w-4" style={{ color: isActiveLink('/trucks') ? 'white' : 'inherit' }} />
              <span style={{ color: isActiveLink('/trucks') ? 'white' : 'inherit' }}>Food Trucks</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/orders"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform ${
                    isActiveLink('/orders') ? 'text-white font-bold scale-105' : 'text-gray-700 hover:scale-105'
                  }`}
                  style={isActiveLink('/orders') ? { 
                    background: 'linear-gradient(135deg, #7d0c0c 0%, #9a0f0f 50%, #b81414 100%)',
                    boxShadow: '0 2px 4px rgba(125, 12, 12, 0.3)',
                    color: 'white !important'
                  } : {}}
                  onMouseEnter={(e) => {
                    if (!isActiveLink('/orders')) {
                      e.target.style.color = '#7d0c0c';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActiveLink('/orders')) {
                      e.target.style.color = '';
                      e.target.style.transform = '';
                    }
                  }}
                >
                  <Package className="h-4 w-4" style={{ color: isActiveLink('/orders') ? 'white' : 'inherit' }} />
                  <span style={{ color: isActiveLink('/orders') ? 'white' : 'inherit' }}>My Orders</span>
                </Link>

                {(user?.role === 'admin' || user?.role === 'truck_manager') && (
                  <Link
                    to={user?.role === 'admin' ? '/admin' : '/manager'}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform ${
                      (isActiveLink('/admin') || isActiveLink('/manager')) ? 'text-white font-bold scale-105' : 'text-gray-700 hover:scale-105'
                    }`}
                    style={(isActiveLink('/admin') || isActiveLink('/manager')) ? { 
                      background: 'linear-gradient(135deg, #7d0c0c 0%, #9a0f0f 50%, #b81414 100%)',
                      boxShadow: '0 2px 4px rgba(125, 12, 12, 0.3)',
                      color: 'white !important'
                    } : {}}
                    onMouseEnter={(e) => {
                      if (!isActiveLink('/admin') && !isActiveLink('/manager')) {
                        e.target.style.color = '#7d0c0c';
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActiveLink('/admin') && !isActiveLink('/manager')) {
                        e.target.style.color = '';
                        e.target.style.transform = '';
                      }
                    }}
                  >
                    <User className="h-4 w-4" style={{ color: (isActiveLink('/admin') || isActiveLink('/manager')) ? 'white' : 'inherit' }} />
                    <span style={{ color: (isActiveLink('/admin') || isActiveLink('/manager')) ? 'white' : 'inherit' }}>Dashboard</span>
                  </Link>
                )}

                <div className="flex items-center space-x-3 border-l pl-3">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 transition-colors"
                    onMouseEnter={(e) => e.target.style.color = '#7d0c0c'}
                    onMouseLeave={(e) => e.target.style.color = ''}
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 font-medium transition-colors duration-200"
                  style={{ color: '#7d0c0c' }}
                  onMouseEnter={(e) => e.target.style.color = '#9a0f0f'}
                  onMouseLeave={(e) => e.target.style.color = '#7d0c0c'}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn transition-transform duration-200 hover:scale-105 text-white font-medium px-4 py-2 rounded-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #7d0c0c 0%, #9a0f0f 50%, #b81414 100%)'
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
            </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-md text-gray-700 transition-colors ${
              scrolled ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}
            onMouseEnter={(e) => e.target.style.color = '#7d0c0c'}
            onMouseLeave={(e) => e.target.style.color = ''}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform ${
                  isActiveLink('/') ? 'text-white font-bold scale-105' : 'text-gray-700 hover:scale-105'
                }`}
                style={isActiveLink('/') ? { 
                  background: 'linear-gradient(135deg, #7d0c0c 0%, #9a0f0f 50%, #b81414 100%)',
                  color: 'white !important'
                } : {}}
                onMouseEnter={(e) => {
                  if (!isActiveLink('/')) {
                    e.target.style.color = '#7d0c0c';
                    e.target.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActiveLink('/')) {
                    e.target.style.color = '';
                    e.target.style.transform = '';
                  }
                }}
              >
                <span style={{ color: isActiveLink('/') ? 'white' : 'inherit' }}>Home</span>
              </Link>
              
              <Link
                to="/trucks"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform ${
                  isActiveLink('/trucks') ? 'text-white font-bold scale-105' : 'text-gray-700 hover:scale-105'
                }`}
                style={isActiveLink('/trucks') ? { 
                  background: 'linear-gradient(135deg, #7d0c0c 0%, #9a0f0f 50%, #b81414 100%)',
                  color: 'white !important'
                } : {}}
                onMouseEnter={(e) => {
                  if (!isActiveLink('/trucks')) {
                    e.target.style.color = '#7d0c0c';
                    e.target.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActiveLink('/trucks')) {
                    e.target.style.color = '';
                    e.target.style.transform = '';
                  }
                }}
              >
                <span style={{ color: isActiveLink('/trucks') ? 'white' : 'inherit' }}>Food Trucks</span>
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform ${
                      isActiveLink('/orders') ? 'text-white font-bold scale-105' : 'text-gray-700 hover:scale-105'
                    }`}
                    style={isActiveLink('/orders') ? { 
                      background: 'linear-gradient(135deg, #7d0c0c 0%, #9a0f0f 50%, #b81414 100%)',
                      color: 'white !important'
                    } : {}}
                    onMouseEnter={(e) => {
                      if (!isActiveLink('/orders')) {
                        e.target.style.color = '#7d0c0c';
                        e.target.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActiveLink('/orders')) {
                        e.target.style.color = '';
                        e.target.style.transform = '';
                      }
                    }}
                  >
                    <span style={{ color: isActiveLink('/orders') ? 'white' : 'inherit' }}>My Orders</span>
                  </Link>

                  {(user?.role === 'admin' || user?.role === 'truck_manager') && (
                    <Link
                      to={user?.role === 'admin' ? '/admin' : '/manager'}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform ${
                        (isActiveLink('/admin') || isActiveLink('/manager')) ? 'text-white font-bold scale-105' : 'text-gray-700 hover:scale-105'
                      }`}
                      style={(isActiveLink('/admin') || isActiveLink('/manager')) ? { 
                        background: 'linear-gradient(135deg, #7d0c0c 0%, #9a0f0f 50%, #b81414 100%)',
                        color: 'white !important'
                      } : {}}
                      onMouseEnter={(e) => {
                        if (!isActiveLink('/admin') && !isActiveLink('/manager')) {
                          e.target.style.color = '#7d0c0c';
                          e.target.style.transform = 'translateX(4px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActiveLink('/admin') && !isActiveLink('/manager')) {
                          e.target.style.color = '';
                          e.target.style.transform = '';
                        }
                      }}
                    >
                      <span style={{ color: (isActiveLink('/admin') || isActiveLink('/manager')) ? 'white' : 'inherit' }}>Dashboard</span>
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 transition-colors"
                    onMouseEnter={(e) => e.target.style.color = '#7d0c0c'}
                    onMouseLeave={(e) => e.target.style.color = ''}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 text-left"
                  >
                    Logout
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    style={{ color: '#7d0c0c' }}
                    onMouseEnter={(e) => e.target.style.color = '#9a0f0f'}
                    onMouseLeave={(e) => e.target.style.color = '#7d0c0c'}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                    style={{ 
                      background: 'linear-gradient(135deg, #7d0c0c 0%, #9a0f0f 50%, #b81414 100%)'
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
