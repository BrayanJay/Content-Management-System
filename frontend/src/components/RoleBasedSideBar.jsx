import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { USER_ROLES } from '../utils/roleConstants.js';
import PropTypes from 'prop-types';

library.add(fas, fab, far);

const RoleBasedSideBar = ({ isMobile, isOpen, onClose }) => {
  const { user, logout, hasPermission, hasRole } = useAuth();

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

  // Define navigation items with their required permissions/roles
  const navItems = [
    {
      id: 'dashboard',
      to: '/',
      icon: 'chart-line',
      label: 'Dashboard',
      show: hasPermission('files', 'upload') || hasPermission('content', 'create')
    },
    {
      id: 'branches',
      to: '/branch-network',
      icon: 'building',
      label: 'Branches',
      show: hasPermission('branches', 'read')
    },
    {
      id: 'documents',
      to: '/documents',
      icon: 'file',
      label: 'Documents',
      show: hasPermission('files', 'read')
    },
    {
      id: 'users',
      to: '/users',
      icon: 'users',
      label: 'Users',
      show: hasRole(USER_ROLES.ADMIN)
    },
    {
      id: 'logs',
      to: '/logs',
      icon: 'list',
      label: 'Logs',
      show: hasPermission('logs', 'read')
    }
  ];

  // Filter items based on user permissions
  const visibleItems = navItems.filter(item => item.show);

  if (isMobile) {
    return (
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-gray-200 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}>
        <div className="h-full flex flex-col p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pt-4">
            <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <FontAwesomeIcon icon={['fas', 'times']} className="text-gray-600" />
            </button>
          </div>

          {/* User Info */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={['fas', 'user']} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{user?.username || 'User'}</p>
                <p className="text-sm text-gray-600 capitalize">{user?.role || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2">
            {visibleItems.map((item) => (
              <Link 
                key={item.id} 
                to={item.to}
                onClick={handleNavClick}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={['fas', item.icon]} className="text-blue-600" />
                </div>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <button 
            onClick={handleLogOut}
            className="flex items-center space-x-3 p-3 mt-4 w-full rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-700 transition-colors border-t border-gray-200 pt-4"
          >
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={['fas', 'power-off']} className="text-red-600" />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop Floating Sidebar Layout
  return (
    <div className="fixed top-1/2 left-5 z-50 -translate-y-1/2">
      <div className="flex flex-col items-center gap-4">
        {/* User Info Badge */}
        <div className="group relative w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center">
          <div className="relative z-10 w-12 h-12 lg:w-16 lg:h-16 bg-green-600 hover:bg-green-500 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-300 ease-in-out">
            <FontAwesomeIcon icon={['fas', 'user']} className="text-white/80 group-hover:text-white text-lg lg:text-xl"/>
          </div>
          
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out text-white text-sm lg:text-base font-semibold bg-green-500 px-3 py-2 rounded-md z-0 whitespace-nowrap pointer-events-none">
            {user?.username || 'User'} ({user?.role || 'Unknown'})
          </div>
        </div>

        {/* Navigation Items */}
        {visibleItems.map((item) => (
          <Link key={item.id} to={item.to}>
            <div className="group relative w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center">
              <div className="relative z-10 w-12 h-12 lg:w-16 lg:h-16 bg-blue-700 hover:bg-blue-500 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-300 ease-in-out">
                <FontAwesomeIcon icon={['fas', item.icon]} className="text-white/80 group-hover:text-white text-lg lg:text-xl"/>
              </div>
              
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out text-white text-sm lg:text-base font-semibold bg-blue-500 px-3 py-2 rounded-md z-0 whitespace-nowrap pointer-events-none">
                {item.label}
              </div>
            </div>
          </Link>
        ))}

        {/* Logout Button */}
        <button onClick={handleLogOut}>
          <div className="group relative w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center">
            <div className="relative z-10 w-12 h-12 lg:w-16 lg:h-16 bg-red-600 hover:bg-red-500 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-300 ease-in-out">
              <FontAwesomeIcon icon={['fas', 'power-off']} className="text-white/80 group-hover:text-white text-lg lg:text-xl"/>
            </div>

            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out text-white text-sm lg:text-base font-semibold bg-red-500 px-3 py-2 rounded-md z-0 whitespace-nowrap pointer-events-none">
              Logout
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

RoleBasedSideBar.propTypes = {
  isMobile: PropTypes.bool,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func
};

export { RoleBasedSideBar };
export default RoleBasedSideBar;
