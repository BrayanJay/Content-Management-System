import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import axios from 'axios';

const PopupToggle = () => {
  const [popupStatus, setPopupStatus] = useState('disabled');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [lastUpdatedBy, setLastUpdatedBy] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState('');
  const { user, hasPermission } = useAuth();

  // Check if user has permission to modify popup settings
  const canModifyPopup = hasPermission('content', 'update') || hasPermission('system', 'update');

  // Fetch current popup status
  const fetchPopupStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/data/popup/status`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setPopupStatus(response.data.data.status);
        setLastUpdatedBy(response.data.data.updated_by);
        setLastUpdatedAt(response.data.data.updated_at);
      }
    } catch (error) {
      console.error('Error fetching popup status:', error);
      // Set default status if fetch fails
      setPopupStatus('disabled');
    } finally {
      setLoading(false);
    }
  };

  // Update popup status
  const updatePopupStatus = async (newStatus) => {
    if (!canModifyPopup) {
      alert('You do not have permission to modify popup settings.');
      return;
    }

    try {
      setUpdating(true);
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/data/popup/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (response.data.success) {
        setPopupStatus(newStatus);
        setLastUpdatedBy(user?.username || 'Unknown');
        setLastUpdatedAt(new Date().toISOString());
        
        // Show success message
        const statusText = newStatus === 'enabled' ? 'enabled' : 'disabled';
        alert(`Popup has been ${statusText} successfully!`);
      }
    } catch (error) {
      console.error('Error updating popup status:', error);
      
      // Show error message
      if (error.response?.status === 403) {
        alert('You do not have permission to modify popup settings.');
      } else {
        alert('Failed to update popup status. Please try again.');
      }
    } finally {
      setUpdating(false);
    }
  };

  // Handle toggle click
  const handleToggle = () => {
    if (updating || !canModifyPopup) return;
    
    const newStatus = popupStatus === 'enabled' ? 'disabled' : 'enabled';
    updatePopupStatus(newStatus);
  };

  // Fetch popup status on component mount
  useEffect(() => {
    fetchPopupStatus();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Popup Management</h3>
          <p className="text-sm text-gray-600">Control the website popup display</p>
        </div>
        
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          popupStatus === 'enabled' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {popupStatus === 'enabled' ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            popupStatus === 'enabled' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="font-medium text-gray-900">
            Popup is currently {popupStatus}
          </span>
        </div>

        <button
          onClick={handleToggle}
          disabled={updating || !canModifyPopup}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            popupStatus === 'enabled' ? 'bg-blue-600' : 'bg-gray-300'
          } ${
            !canModifyPopup ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          } ${updating ? 'opacity-50 cursor-wait' : ''}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            popupStatus === 'enabled' ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Permission Warning */}
      {!canModifyPopup && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You don&apos;t have permission to modify popup settings. Contact an administrator for assistance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>Last updated by: <span className="font-medium">{lastUpdatedBy || 'Unknown'}</span></div>
        <div>Last updated: <span className="font-medium">{formatDate(lastUpdatedAt)}</span></div>
      </div>

      {/* Refresh Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={fetchPopupStatus}
          disabled={loading || updating}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 focus:outline-none focus:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>
    </div>
  );
};

export default PopupToggle;
