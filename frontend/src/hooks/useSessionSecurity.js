import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth.js';
import { SECURITY_CONFIG } from '../utils/security.js';

export const useSessionSecurity = () => {
  const { logout, isAuthenticated } = useAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [sessionWarning, setSessionWarning] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setSessionWarning(false);
  }, []);

  // Check session expiration
  const checkSessionExpiry = useCallback(() => {
    if (!isAuthenticated) return;

    const now = Date.now();
    const timeElapsed = now - lastActivity;
    const warningThreshold = SECURITY_CONFIG.SESSION_TIMEOUT - (5 * 60 * 1000); // 5 minutes before expiry

    if (timeElapsed >= SECURITY_CONFIG.SESSION_TIMEOUT) {
      setIsSessionExpired(true);
      logout();
      return;
    }

    if (timeElapsed >= warningThreshold && !sessionWarning) {
      setSessionWarning(true);
    }
  }, [isAuthenticated, lastActivity, sessionWarning, logout]);

  // Extend session
  const extendSession = useCallback(() => {
    updateActivity();
    setSessionWarning(false);
  }, [updateActivity]);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const throttledUpdateActivity = throttle(updateActivity, 1000);

    // Add activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledUpdateActivity, true);
    });

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledUpdateActivity, true);
      });
    };
  }, [isAuthenticated, updateActivity]);

  // Session expiry checker
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(checkSessionExpiry, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, checkSessionExpiry]);

  // Security monitoring
  const [securityAlerts, setSecurityAlerts] = useState([]);

  const addSecurityAlert = useCallback((type, message) => {
    const alert = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date()
    };

    setSecurityAlerts(prev => [...prev, alert]);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      setSecurityAlerts(prev => prev.filter(a => a.id !== alert.id));
    }, 10000);
  }, []);

  // Monitor for suspicious activity
  const monitorSecurity = useCallback(() => {
    // Check for multiple tabs (basic detection)
    if (document.hidden) {
      addSecurityAlert('info', 'Session continued in background tab');
    }

    // Check for developer tools (basic detection)
    if (window.devtools?.open) {
      addSecurityAlert('warning', 'Developer tools detected');
    }
  }, [addSecurityAlert]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const securityInterval = setInterval(monitorSecurity, 30000); // Check every 30 seconds

    return () => clearInterval(securityInterval);
  }, [isAuthenticated, monitorSecurity]);

  return {
    sessionWarning,
    isSessionExpired,
    securityAlerts,
    extendSession,
    updateActivity,
    timeUntilExpiry: SECURITY_CONFIG.SESSION_TIMEOUT - (Date.now() - lastActivity),
    addSecurityAlert
  };
};

// Throttle utility function
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export default useSessionSecurity;
