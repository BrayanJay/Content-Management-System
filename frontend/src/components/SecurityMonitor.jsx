import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSessionSecurity } from '../hooks/useSessionSecurity.js';
import PropTypes from 'prop-types';

const SecurityMonitor = () => {
  const { 
    sessionWarning, 
    securityAlerts, 
    extendSession, 
    timeUntilExpiry 
  } = useSessionSecurity();

  const [dismissed, setDismissed] = useState(false);

  // Don't show if user dismissed the warning
  if (dismissed) return null;

  // Format time remaining
  const formatTimeRemaining = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Session Warning Modal */}
      {sessionWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <FontAwesomeIcon 
                  icon={['fas', 'clock']} 
                  className="text-yellow-500 text-2xl" 
                />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Session Expiring Soon
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Your session will expire in{' '}
                <span className="font-semibold text-red-600">
                  {formatTimeRemaining(timeUntilExpiry)}
                </span>
                . Would you like to extend your session?
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={extendSession}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Extend Session
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Alerts */}
      <div className="fixed top-20 right-4 z-40 space-y-2">
        {securityAlerts.map(alert => (
          <SecurityAlert
            key={alert.id}
            alert={alert}
          />
        ))}
      </div>
    </>
  );
};

const SecurityAlert = ({ alert }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const getAlertStyles = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'info':
        return 'bg-blue-100 border-blue-500 text-blue-700';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'error':
        return 'exclamation-triangle';
      case 'warning':
        return 'exclamation-circle';
      case 'info':
        return 'info-circle';
      default:
        return 'bell';
    }
  };

  return (
    <div className={`
      ${getAlertStyles(alert.type)}
      border-l-4 p-4 rounded-md shadow-md max-w-sm
      transform transition-all duration-300 ease-in-out
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FontAwesomeIcon 
            icon={['fas', getIcon(alert.type)]} 
            className="mt-0.5" 
          />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            Security Alert
          </p>
          <p className="text-sm mt-1">
            {alert.message}
          </p>
          <p className="text-xs mt-1 opacity-75">
            {alert.timestamp.toLocaleTimeString()}
          </p>
        </div>
        <div className="ml-3">
          <button
            onClick={() => setVisible(false)}
            className="text-current opacity-50 hover:opacity-75"
            aria-label="Dismiss alert"
          >
            <FontAwesomeIcon icon={['fas', 'times']} />
          </button>
        </div>
      </div>
    </div>
  );
};

SecurityAlert.propTypes = {
  alert: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    timestamp: PropTypes.instanceOf(Date).isRequired
  }).isRequired
};

export default SecurityMonitor;
