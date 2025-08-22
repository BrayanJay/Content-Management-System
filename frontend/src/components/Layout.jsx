import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import RoleBasedSideBar from "./RoleBasedSideBar.jsx";

const Layout = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hide Sidebar for Login & Signup pages
  const hideSidebarRoutes = ["/login"];
  const shouldShowSidebar = !hideSidebarRoutes.includes(location.pathname);

  // Handle responsive design
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowSidebar && (
        <>
          {/* Mobile Sidebar Toggle Button */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="fixed top-20 left-4 z-[60] bg-blue-600 text-white p-3 rounded-xl shadow-lg hover:bg-blue-700 transition-colors md:hidden"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}

          {/* Sidebar */}
          <RoleBasedSideBar 
            isMobile={isMobile}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </>
      )}

      {/* Main Content */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${shouldShowSidebar && !isMobile ? 'md:ml-20' : ''}
        min-h-screen
      `}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
