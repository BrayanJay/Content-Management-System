import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { Link } from 'react-router-dom';

library.add(fas, fab, far);

const SideBar = () => {

    const handleLogOut = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        const data = await response.json();
        if (data.message === 'Logged out successfully') {
            // Redirect to login page or update UI
            window.location.href = '/login';
        }
    }
    
  return (
    <div>
        {/* Sidebar */}
        <div className="flex fixed top-1/4 left-5 flex-col items-center gap-8 z-50">

              {/* Home Tab */}
              {/*<Link to="/">
              <div className="group relative w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 flex items-center justify-center p-5">

                <div className="relative z-10 w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-blue-700 hover:bg-blue-500 rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-300 ease-in-out p-5">
                    <FontAwesomeIcon icon={['fas', 'home']} className="text-white/80 group-hover:text-white text-base md:text-lg lg:text-xl"/>
                </div>
                
                <div className="absolute left-0 md:left-1 lg:left-3 top-1/2 -translate-y-1/2 -translate-x-6 opacity-0 group-hover:translate-x-12 group-hover:opacity-100 transition-all duration-500 ease-in-out text-white text-sm md:text-base lg:text-lg font-semibold bg-blue-500 px-2 py-1 rounded-md z-0">
                    Dashboard
                </div>
            </div>
            </Link>*/}

            {/* Uploads Tab */}
            <Link to="/">
            <div className="group relative w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 flex items-center justify-center p-5">

                <div className="relative z-10 w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-blue-700 hover:bg-blue-500 rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-300 ease-in-out p-5">
                    <FontAwesomeIcon icon={['fas', 'file-arrow-up']} className="text-white/80 group-hover:text-white text-base md:text-lg lg:text-xl p-1"/>
                </div>
                
                <div className="absolute left-0 md:left-1 lg:left-3 top-1/2 -translate-y-1/2 -translate-x-6 opacity-0 group-hover:translate-x-12 group-hover:opacity-100 transition-all duration-500 ease-in-out text-white text-sm md:text-base lg:text-lg font-semibold bg-blue-500 px-2 py-1 rounded-md z-0">
                    Uploads
                </div>
            </div>
            </Link>

            {/* Uploads Tab */}
            <Link to="/branch-network">
            <div className="group relative w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 flex items-center justify-center p-5">

                <div className="relative z-10 w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-blue-700 hover:bg-blue-500 rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-300 ease-in-out p-5">
                    <FontAwesomeIcon icon={['fas', 'building']} className="text-white/80 group-hover:text-white text-base md:text-lg lg:text-xl p-1"/>
                </div>
                
                <div className="absolute left-0 md:left-1 lg:left-3 top-1/2 -translate-y-1/2 -translate-x-6 opacity-0 group-hover:translate-x-12 group-hover:opacity-100 transition-all duration-500 ease-in-out text-white text-sm md:text-base lg:text-lg font-semibold bg-blue-500 px-2 py-1 rounded-md z-0">
                    Branches
                </div>
            </div>
            </Link>

            {/* Inquiries Tab */}
            <Link to="/documents">
            <div className="group relative w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 flex items-center justify-center p-5">

                <div className="relative z-10 w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-blue-700 hover:bg-blue-500 rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-300 ease-in-out p-5">
                    <FontAwesomeIcon icon={['fas', 'file']} className="text-white/80 group-hover:text-white text-base md:text-lg lg:text-xl p-1"/>
                </div>

                <div className="absolute left-0 md:left-1 lg:left-3 top-1/2 -translate-y-1/2 -translate-x-6 opacity-0 group-hover:translate-x-12 group-hover:opacity-100 transition-all duration-500 ease-in-out text-white text-sm md:text-base lg:text-lg font-semibold bg-blue-500 px-2 py-1 rounded-md z-0">
                    Documents
                </div>
            </div>
            </Link>

            {/* Logout Tab */}
            <button onClick={handleLogOut}>
            <div className="group relative w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 flex items-center justify-center p-5">

                <div className="relative z-10 w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-blue-700 hover:bg-blue-500 rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-300 ease-in-out p-5">
                    <FontAwesomeIcon icon={['fas', 'power-off']} className="text-white/80 group-hover:text-white text-base md:text-lg lg:text-xl p-1"/>
                </div>

                <div className="absolute left-0 md:left-1 lg:left-3 top-1/2 -translate-y-1/2 -translate-x-6 opacity-0 group-hover:translate-x-12 group-hover:opacity-100 transition-all duration-500 ease-in-out text-white text-sm md:text-base lg:text-lg font-semibold bg-blue-500 px-2 py-1 rounded-md z-0">
                    Logout
                </div>
            </div>
            </button>

        </div>

    </div>
  )
}

export default SideBar