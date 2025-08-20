import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import aaf_logo from '../media/logo.webp';

const Header = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Don't show header on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center z-30 border-b border-gray-200">
      {/* Logo and Title */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="flex-shrink-0">
          <img 
            src={aaf_logo} 
            alt="AAF Logo"
            className="h-8 sm:h-10 w-auto"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-blue-900 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold truncate">
            Content Management System - AAF Corporate Website
          </h1>
        </div>
      </div>

      {/* User Info and Status - Only show when authenticated */}
      {isAuthenticated && (
        <div className="flex items-center space-x-4">
          {/* Current Time - Hidden on mobile */}
          <div className="hidden md:flex flex-col items-end text-xs text-gray-600">
            <span className="font-medium">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
            <span>
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>

          {/* User Status Badge */}
          <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-2 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="text-xs font-medium text-green-800 hidden sm:block">
              {user?.username || 'User'}
            </div>
            <div className="text-xs text-green-600 capitalize hidden lg:block">
              ({user?.role || 'N/A'})
            </div>
          </div>

          {/* Security Indicator */}
          <div className="hidden lg:flex items-center space-x-1 text-xs text-gray-500">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secure Session</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;