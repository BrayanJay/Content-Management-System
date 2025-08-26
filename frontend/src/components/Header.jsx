import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Clock, Shield, User } from 'lucide-react';
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
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center z-30 border-b border-gray-200/50">
      {/* Logo and Title */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="flex-shrink-0">
          <img 
            src={aaf_logo} 
            alt="AAF Logo"
            className="h-8 sm:h-10 w-auto drop-shadow-sm"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col">
            <h1 className="text-blue-900 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold truncate">
              AAF Content Management
            </h1>
            <p className="text-gray-500 text-xs hidden sm:block truncate">
              Corporate Website Administration
            </p>
          </div>
        </div>
      </div>

      {/* User Info and Status - Only show when authenticated */}
      {isAuthenticated && (
        <div className="flex items-center space-x-3">
          {/* Current Time - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-lg px-3 py-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <div className="flex flex-col items-start text-xs">
              <span className="font-medium text-gray-800">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <span className="text-blue-600 font-semibold">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>

          {/* User Status Badge */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-lg px-3 py-2 shadow-sm">
            <div className="relative">
              <User className="w-4 h-4 text-green-700" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
            </div>
            <div className="flex flex-col items-start">
              <div className="text-xs font-semibold text-green-800">
                {user?.username || 'User'}
              </div>
              <div className="text-xs text-green-600 capitalize hidden lg:block">
                {user?.role || 'N/A'}
              </div>
            </div>
          </div>

          {/* Security Indicator */}
          <div className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200/50 rounded-lg px-3 py-2 shadow-sm">
            <Shield className="w-4 h-4 text-gray-600" />
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium text-gray-700">Secure</span>
              <span className="text-xs text-gray-500">Session</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;