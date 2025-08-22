import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../hooks/useAuth.js';
import axios from "axios";
import { FaBuildingColumns, FaChartPie } from "react-icons/fa6";

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const [regionStats, setRegionStats] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch branch statistics
  useEffect(() => {
    const fetchBranchStats = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/branch/branches/stats/regions`,
          { withCredentials: true }
        );
        
        // The response already contains the region statistics in the correct format
        const stats = response.data.map(stat => ({
          region: stat.region_name_en,
          count: stat.branch_count
        })).sort((a, b) => b.count - a.count); // Sort by count descending
        
        setRegionStats(stats);
      } catch (error) {
        console.error("Error fetching branch statistics:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchBranchStats();
  }, []);

  // Check permissions when component mounts
  useEffect(() => {
    if (!hasPermission('content', 'create') && !hasPermission('files', 'upload')) {
      console.warn('User lacks required permissions for content upload');
    }
  }, [hasPermission]);

  // Define dashboard cards with permission checks
  const dashboardCards = [
    {
      id: 'landing',
      to: '/landingPage',
      title: 'Landing Page',
      requiredPermission: ['content', 'read'],
      color: 'bg-blue-200 hover:bg-blue-300'
    },
    {
      id: 'about',
      to: '/aboutPage',
      title: 'About Page',
      requiredPermission: ['content', 'read'],
      color: 'bg-blue-200 hover:bg-blue-300'
    },
    {
      id: 'products',
      to: '/productsPage',
      title: 'Products Page',
      requiredPermission: ['content', 'read'],
      color: 'bg-blue-200 hover:bg-blue-300'
    },
    {
      id: 'investor',
      to: '/investorRelationsPage',
      title: 'Investor Relations Page',
      requiredPermission: ['content', 'read'],
      color: 'bg-green-200 hover:bg-green-300'
    },
    {
      id: 'careers',
      to: '/careers',
      title: 'Careers Page',
      requiredPermission: ['content', 'read'],
      color: 'bg-purple-200 hover:bg-purple-300'
    },
    {
      id: 'contact',
      to: '/contacts',
      title: 'Contact Page',
      requiredPermission: ['content', 'read'],
      color: 'bg-indigo-200 hover:bg-indigo-300'
    }
  ];

  // Filter cards based on user permissions
  const visibleCards = dashboardCards.filter(card => 
    hasPermission(card.requiredPermission[0], card.requiredPermission[1])
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 pt-20 md:pt-24">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 rounded-lg mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome back, {user?.username || 'User'}!
              </h1>
              <p className="mt-1 text-sm text-gray-600 capitalize">
                Role: {user?.role || 'Unknown'} • Content Management Dashboard
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                System Online
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Branch Network Overview */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <FaChartPie className="text-blue-600 text-xl" />
            <h2 className="text-xl font-bold text-gray-800">Branch Network Overview</h2>
          </div>
          
          {isLoadingStats ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading statistics...</span>
            </div>
          ) : regionStats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {regionStats.map((stat, index) => (
                <div 
                  key={stat.region} 
                  className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.region.charAt(0).toUpperCase() + stat.region.slice(1)}
                      </p>
                      <p className="text-2xl font-bold text-blue-700">{stat.count}</p>
                      <p className="text-xs text-gray-500">
                        {stat.count === 1 ? 'Branch' : 'Branches'}
                      </p>
                    </div>

                  </div>
                </div>
              ))}
              
              {/* Total Summary Card */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-green-700">
                      {regionStats.reduce((sum, stat) => sum + stat.count, 0)}
                    </p>
                    <p className="text-xs text-gray-500">All Branches</p>
                  </div>
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    <FaBuildingColumns className="text-sm" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No branch data available</p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Security Information
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>Your access is limited to your role permissions. All actions are logged for security purposes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        {visibleCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {visibleCards.map((card) => (
              <Link 
                key={card.id} 
                to={card.to}
                className="group block"
              >
                <div className={`
                  ${card.color} 
                  p-6 rounded-xl shadow-md 
                  transform transition-all duration-300 ease-in-out 
                  hover:scale-105 hover:shadow-lg 
                  border border-transparent hover:border-gray-300
                  min-h-[140px] flex items-center justify-center
                  relative overflow-hidden
                `}>
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute right-4 top-4 w-12 h-12 bg-white rounded-full"></div>
                    <div className="absolute left-4 bottom-4 w-8 h-8 bg-white rounded-full"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative text-center">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {card.title}
                    </h3>
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm text-gray-600">Click to manage content</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M28 36v-4a6 6 0 00-6-6v0a6 6 0 00-6 6v4m16 0v-1.338c0-.859-.354-1.676-.927-2.267M28 36H20m8 0h-8" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No accessible content</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don&apos;t have permission to access any content management features.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
