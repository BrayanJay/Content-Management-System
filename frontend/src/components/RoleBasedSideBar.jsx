import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { USER_ROLES } from '../utils/roleConstants.js';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

library.add(fas, fab, far);

const RoleBasedSideBar = ({ isMobile = false, isOpen = false, onClose = null }) => {
  const { user, logout, hasPermission, hasRole } = useAuth();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogOut = async () => {
    await logout();
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Define navigation items with their required permissions/roles and enhanced styling
  const navItems = [
    {
      id: 'dashboard',
      to: '/',
      icon: 'chart-line',
      label: 'Dashboard',
      description: 'Overview & Analytics',
      color: 'from-blue-500 to-blue-600',
      show: hasPermission('files', 'upload') || hasPermission('content', 'create')
    },
    {
      id: 'branches',
      to: '/branch-network',
      icon: 'building',
      label: 'Branches',
      description: 'Network Management',
      color: 'from-emerald-500 to-emerald-600',
      show: hasPermission('branches', 'read')
    },
    {
      id: 'documents',
      to: '/documents',
      icon: 'file-alt',
      label: 'Documents',
      description: 'File Management',
      color: 'from-purple-500 to-purple-600',
      show: hasPermission('files', 'read')
    },
    {
      id: 'users',
      to: '/users',
      icon: 'users-cog',
      label: 'Users',
      description: 'User Administration',
      color: 'from-orange-500 to-orange-600',
      show: hasRole(USER_ROLES.ADMIN)
    },
    {
      id: 'logs',
      to: '/logs',
      icon: 'clipboard-list',
      label: 'System Logs',
      description: 'Activity Monitor',
      color: 'from-indigo-500 to-indigo-600',
      show: hasPermission('logs', 'read')
    }
  ];

  // Filter items based on user permissions
  const visibleItems = navItems.filter(item => item.show);

  // Check if current path is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
        />
        
        {/* Sidebar */}
        <div className={`
          fixed top-0 left-0 h-full w-80 bg-white z-50 
          shadow-2xl transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Navigation</h2>
                  <p className="text-blue-100 text-sm mt-1">Content Management</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
                  aria-label="Close sidebar"
                >
                  <FontAwesomeIcon icon={['fas', 'times']} className="text-xl" />
                </button>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FontAwesomeIcon icon={['fas', 'user']} className="text-white text-xl" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{user?.username || 'User'}</h3>
                  <p className="text-sm text-gray-500 capitalize">{user?.role || 'Unknown'}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">Active Session</p>
                </div>
              </div>
            </div>

            {/* Time & Status */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FontAwesomeIcon icon={['fas', 'clock']} className="text-blue-500" />
                  <span>{currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</span>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">Online</span>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {visibleItems.map((item) => {
                const isActive = isActiveRoute(item.to);
                return (
                  <Link 
                    key={item.id} 
                    to={item.to}
                    onClick={handleNavClick}
                    className={`
                      group relative flex items-center p-4 rounded-2xl transition-all duration-200
                      ${isActive 
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-[1.02]` 
                        : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
                      ${isActive 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : `bg-gradient-to-r ${item.color} text-white shadow-sm group-hover:shadow-md`
                      }
                    `}>
                      <FontAwesomeIcon 
                        icon={['fas', item.icon]} 
                        className={`text-lg ${isActive ? 'text-white' : 'text-white'}`} 
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </h4>
                      <p className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={handleLogOut}
                className="w-full flex items-center p-4 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={['fas', 'sign-out-alt']} className="text-lg" />
                </div>
                <div className="ml-4 flex-1 text-left">
                  <h4 className="font-semibold text-sm">Sign Out</h4>
                  <p className="text-xs text-white/80">End your session</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop Sidebar - Modern Floating Design
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden md:block">
      <div className="flex flex-col items-center space-y-4">
        {/* Main Navigation Container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-3 overflow-hidden">
          {/* User Avatar */}
          <div className="group relative mb-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <FontAwesomeIcon icon={['fas', 'user']} className="text-white text-xl" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
            </div>
            
            {/* User Info Tooltip */}
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
              <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl min-w-max">
                <div className="font-semibold text-sm">{user?.username || 'User'}</div>
                <div className="text-xs text-gray-300 capitalize">{user?.role || 'Unknown'}</div>
                <div className="text-xs text-green-400 mt-1 flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                  Active
                </div>
                {/* Arrow */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-3">
            {visibleItems.map((item) => {
              const isActive = isActiveRoute(item.to);
              return (
                <Link key={item.id} to={item.to} className="block">
                  <div className="group relative">
                    <div className={`
                      relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md
                      ${isActive 
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105` 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 hover:shadow-lg hover:scale-105'
                      }
                    `}>
                      <FontAwesomeIcon 
                        icon={['fas', item.icon]} 
                        className={`text-lg ${isActive ? 'text-white' : ''}`} 
                      />
                      {isActive && (
                        <div className="absolute -right-1 -top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                      )}
                    </div>
                    
                    {/* Navigation Tooltip */}
                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                      <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl min-w-max">
                        <div className="font-semibold text-sm">{item.label}</div>
                        <div className="text-xs text-gray-300">{item.description}</div>
                        {/* Arrow */}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

          {/* Logout Button */}
          <button onClick={handleLogOut} className="w-full">
            <div className="group relative">
              <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105">
                <FontAwesomeIcon icon={['fas', 'sign-out-alt']} className="text-white text-lg" />
              </div>
              
              {/* Logout Tooltip */}
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl min-w-max">
                  <div className="font-semibold text-sm">Sign Out</div>
                  <div className="text-xs text-gray-300">End your session</div>
                  {/* Arrow */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              </div>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};

RoleBasedSideBar.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func
};

RoleBasedSideBar.defaultProps = {
  isMobile: false,
  isOpen: false,
  onClose: null
};

export { RoleBasedSideBar };
export default RoleBasedSideBar;
