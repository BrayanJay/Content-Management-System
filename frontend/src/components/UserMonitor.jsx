import { useState, useEffect } from 'react';
import { RefreshCw, Users, Clock, Shield, Eye, EyeOff } from 'lucide-react';

const UserMonitor = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalUsers: 0,
    roleDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchActiveUsers = async () => {
    try {
      const response = await fetch('/api/sessions/active', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch active users');
      }
      
      const data = await response.json();
      setActiveUsers(data.users);
      setStats({
        activeUsers: data.activeUsers,
        totalUsers: data.totalUsers,
        roleDistribution: data.roleDistribution
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveUsers();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchActiveUsers, 10000); // Refresh every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleForceLogout = async (userId) => {
    if (!confirm('Are you sure you want to force logout this user?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/sessions/force-logout/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        fetchActiveUsers(); // Refresh the list
      } else {
        alert('Failed to logout user');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      content_manager: 'bg-blue-100 text-blue-800',
      branch_manager: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const formatTimeSince = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m ago`;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2">Loading user data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Auto Refresh</h3>
                <p className="text-sm text-gray-600">Every 10 seconds</p>
              </div>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg ${autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
            >
              {autoRefresh ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Role Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.roleDistribution.map((role, index) => (
            <div key={index} className="text-center">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(role.role)}`}>
                {role.role}
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-2">{role.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Users List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Currently Active Users</h3>
          <button
            onClick={fetchActiveUsers}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}
        
        <div className="p-6">
          {activeUsers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No active users found</p>
          ) : (
            <div className="space-y-4">
              {activeUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{user.username}</h4>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Last seen</p>
                      <p className="text-sm font-medium">{formatTimeSince(user.minutes_since_login)}</p>
                    </div>
                    
                    <button
                      onClick={() => handleForceLogout(user.id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                      Force Logout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMonitor;
