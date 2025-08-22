import axios from "axios";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import UpdateProfile from "./UpdateProfile";

const GetProfileDetails = () => {
  const [bodData, setBodData] = useState([]);
  const [coopData, setCoopData] = useState([]);
  const [selectedLang, setSelectedLang] = useState("en");

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);


  const tokenUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/aboutpagecontents`;
  const navigate = useNavigate();

  useEffect(() => {
        // Fetch user authentication
        const fetchUser = async () => {
          try {
            await axios.get(tokenUrl, {
              withCredentials: true,
            });
          } catch (err) {
            navigate("/login");
            console.log(err);
          }
        };

        const fetchBODData = async () => {
          try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/profile/getProfiles/bod`);
            const updatedData = res.data.map(profile => ({
              ...profile,
              // No need to parse here since backend already returns parsed arrays
            }));
            setBodData(Array.isArray(updatedData) ? updatedData : []);
          } catch (err) {
            console.log("Error fetching data:", err.message);
          }
        };

        const fetchCOOPData = async () => {
          try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/profile/getProfiles/coop`);
            const updatedData = res.data.map(profile => ({
              ...profile,
              // No need to parse here since backend already returns parsed arrays
            }));
            setCoopData(Array.isArray(updatedData) ? updatedData : []);
          } catch (err) {
            console.log("Error fetching data:", err.message);
          }
        };
      
        fetchBODData();
        fetchCOOPData();
        fetchUser();
      }, [navigate, tokenUrl]);

  const handleUpdateClick = (item) => {
    setSelectedItem(item); // Store the selected row's data
    setIsPopupOpen(true);  // Show the popup
  };

  const handleDeleteClick = async (profileId, profileType) => {
    if (window.confirm("Are you sure you want to delete this profile?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/profile/deleteProfile`, {
          withCredentials: true,
          data: { id: profileId, type: profileType }
        });
        
        // Refresh the data after deletion
        if (profileType === 'bod') {
          setBodData(prevData => prevData.filter(profile => profile.id !== profileId));
        } else {
          setCoopData(prevData => prevData.filter(profile => profile.id !== profileId));
        }
        
        alert("Profile deleted successfully!");
      } catch (err) {
        console.error("Error deleting profile:", err);
        alert("Failed to delete profile: " + (err.response?.data?.message || err.message));
      }
    }
  };


  return (
    <div className="p-4 md:p-6 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Profile Management</h1>
          
          {/* Controls */}
          <div className="bg-gray-50 p-3 md:p-4 rounded-lg mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
              {/* Language Selection */}
              <div className="w-full sm:w-auto min-w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Language</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  onChange={(e) => setSelectedLang(e.target.value)}
                  value={selectedLang}
                >
                  <option value="en">English</option>
                  <option value="si">Sinhala</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>

              <Link to="/profiles/add" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-blue-600 text-white px-3 md:px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium transition-colors">
                  + Add Profile
                </button>
              </Link>
            </div>
          </div>

          {/* Board of Directors Section */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">Board of Directors</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 md:px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-2 md:px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-2 md:px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="px-2 md:px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Description
                    </th>
                    <th className="px-2 md:px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bodData.length > 0 ? (
                    bodData.map((profile, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-2 md:px-4 py-3 md:py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {profile.id}
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-sm text-gray-900">
                          <div className="max-w-xs">
                            {selectedLang === 'en' ? profile.name_en : selectedLang === 'si' ? profile.name_si : profile.name_ta}
                          </div>
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-sm text-gray-900">
                          <div className="max-w-xs">
                            {selectedLang === 'en' ? profile.designation_en : selectedLang === 'si' ? profile.designation_si : profile.designation_ta}
                          </div>
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-sm text-gray-900 hidden md:table-cell">
                          <div className="max-w-md max-h-32 overflow-y-auto">
                            {selectedLang === 'en' ? profile.description_en?.map((desc, i) => (
                              <div key={i} className="mb-1">
                                <span className="text-sm leading-relaxed">{desc}</span>
                              </div>
                            )) : selectedLang === 'si' ? profile.description_si?.map((desc, i) => (
                              <div key={i} className="mb-1">
                                <span className="text-sm leading-relaxed">{desc}</span>
                              </div>
                            )) : profile.description_ta?.map((desc, i) => (
                              <div key={i} className="mb-1">
                                <span className="text-sm leading-relaxed">{desc}</span>
                              </div>
                            )) || <span className="text-gray-400 text-sm">No description available</span>}
                          </div>
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-1 md:space-x-2">
                            <button 
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 md:px-3 py-1 rounded text-xs font-medium transition-colors" 
                              onClick={() => handleUpdateClick(profile)}
                            >
                              Edit
                            </button>
                            <button 
                              className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs transition-colors"
                              onClick={() => handleDeleteClick(profile.id, 'bod')}
                            > 
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Corporate Management Section */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">Corporate Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 md:px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-2 md:px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-2 md:px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="px-2 md:px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Description
                    </th>
                    <th className="px-2 md:px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coopData.length > 0 ? (
                    coopData.map((profile, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-2 md:px-4 py-3 md:py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {profile.id}
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-sm text-gray-900">
                          <div className="max-w-xs">
                            {selectedLang === 'en' ? profile.name_en : selectedLang === 'si' ? profile.name_si : profile.name_ta}
                          </div>
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-sm text-gray-900">
                          <div className="max-w-xs">
                            {selectedLang === 'en' ? profile.designation_en : selectedLang === 'si' ? profile.designation_si : profile.designation_ta}
                          </div>
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-sm text-gray-900 hidden md:table-cell">
                          <div className="max-w-md max-h-32 overflow-y-auto">
                            {selectedLang === 'en' ? profile.description_en?.map((desc, i) => (
                              <div key={i} className="mb-1">
                                <span className="text-sm leading-relaxed">{desc}</span>
                              </div>
                            )) : selectedLang === 'si' ? profile.description_si?.map((desc, i) => (
                              <div key={i} className="mb-1">
                                <span className="text-sm leading-relaxed">{desc}</span>
                              </div>
                            )) : profile.description_ta?.map((desc, i) => (
                              <div key={i} className="mb-1">
                                <span className="text-sm leading-relaxed">{desc}</span>
                              </div>
                            )) || <span className="text-gray-400 text-sm">No description available</span>}
                          </div>
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-1 md:space-x-2">
                            <button 
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 md:px-3 py-1 rounded text-xs font-medium transition-colors" 
                              onClick={() => handleUpdateClick(profile)}
                            >
                              Edit
                            </button>
                            <button 
                              className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs transition-colors"
                              onClick={() => handleDeleteClick(profile.id, 'coop')}
                            > 
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Update Profile Popup */}
          {isPopupOpen && selectedItem && (
            <UpdateProfile
              isOpen={isPopupOpen}
              onClose={() => setIsPopupOpen(false)}
              id={selectedItem.id}
              initialName={selectedLang === 'en' ? selectedItem.name_en : selectedLang === 'si' ? selectedItem.name_si : selectedItem.name_ta}
              initialType={selectedItem.type || (bodData.some(item => item.id === selectedItem.id) ? 'bod' : 'coop')}
              initialDesignation={selectedLang === 'en' ? selectedItem.designation_en : selectedLang === 'si' ? selectedItem.designation_si : selectedItem.designation_ta}
              initialDescription={selectedLang === 'en' ? selectedItem.description_en : selectedLang === 'si' ? selectedItem.description_si : selectedItem.description_ta}
              tokenUrl={tokenUrl}
              lang={selectedLang}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default GetProfileDetails
