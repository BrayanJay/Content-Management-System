
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  // Don't show footer on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          {/* Copyright */}
          <div className="text-center sm:text-left">
            <span className="text-xs sm:text-sm text-gray-500">
              © {new Date().getFullYear()}{' '}
              <span className="text-blue-600 font-semibold">Asia Asset Finance PLC</span>
              . All Rights Reserved
            </span>
          </div>

          {/* Security and System Info */}
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>SSL Secured</span>
            </div>
            <div className="hidden sm:block">•</div>
            <div className="hidden sm:block">
              CMS v2.0
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;