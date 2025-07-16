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

    <div className="flex flex-col">
      
      <div className="flex flex-row justify-between items-center mb-4">
      {/* Language Selection */}
        <div className="relative w-full max-w-md py-4">
          <span>Select Language</span>
          <select
            className="w-full px-3 py-2 border rounded-md bg-white cursor-pointer justify-between flex items-center"
            onChange={(e) => setSelectedLang(e.target.value)}
            value={selectedLang}
          >
            <option value="en">English</option>
            <option value="si">Sinhala</option>
            <option value="ta">Tamil</option>
          </select>
        </div>

        <Link to="/profiles/add">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">+ Add Profile</button>
        </Link>

        </div>

      <div className="">
      <h1 className="text-blue-800 font-semibold text-xl">Board of Directors</h1>
      <table className="w-full table-auto border">
                    <thead className='bg-blue-200'>
                        <tr className="">
                            <th className="px-3 py-2 text-left min-w-24">Profile ID</th>
                            <th className="px-3 py-2 text-left min-w-32">Name</th>
                            <th className="px-3 py-2 text-left">Designation</th>
                            <th className="px-3 py-2 text-center">Description</th>
                            <th className="px-3 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bodData.length > 0 ? (
                          bodData.map( (profile, index) => (
                            <tr className='h-full odd:bg-blue-50 even:bg-blue-100 col-span-6' key={index}>
                              <th className="py-2 px-3 text-center">{profile.id}</th>
                                <td className="py-2 px-3">
                                  <div className="max-h-32 max-w-64 overflow-y-auto">
                                    {selectedLang === 'en' ? profile.name_en : selectedLang === 'si' ? profile.name_si : profile.name_ta}
                                    </div>

                                </td>
                                <td className="py-2 px-3">
                                  <div className="max-h-32 max-w-64 overflow-y-auto">
                                    {selectedLang === 'en' ? profile.designation_en : selectedLang === 'si' ? profile.designation_si : profile.designation_ta}
                                    </div>
                                </td>
                                {/* ✅ Display JSON array properly */}
                                <td className=" flex flex-row py-2 px-3">
                                  <div className='flex flex-col gap-y-2 max-h-32 max-w-auto overflow-y-auto'>
                                  {selectedLang === 'en' ? profile.description_en?.map((desc, i) => (
                                    <div key={i} className="flex items-start">
                                      <span className="text-sm leading-relaxed">{desc}</span>
                                    </div>
                                  )) : selectedLang === 'si' ? profile.description_si?.map((desc, i) => (
                                    <div key={i} className="flex items-start">
                                      <span className="text-sm leading-relaxed">{desc}</span>
                                    </div>
                                  )) : profile.description_ta?.map((desc, i) => (
                                    <div key={i} className="flex items-start">
                                      <span className="text-sm leading-relaxed">{desc}</span>
                                    </div>
                                  )) || <span className="text-gray-400 text-sm">No description available</span>}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center min-w-36">
                                  <div className='flex flex-row justify-center items-center'>
                                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2" 
                                     onClick={() => handleUpdateClick(profile)}
                                      >
                                      Edit
                                    </button>
                                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                                      onClick={() => handleDeleteClick(profile.id, 'bod')}
                                      > 
                                      <Trash2/>
                                    </button>
                                  </div>
                                </td>
                            </tr>
                            
                            ))
                          ) : (
                            <tr>
                                    <td colSpan="5" className="text-center border border-gray-300 px-4 py-2 text-gray-500">
                                      No data available
                                    </td>
                                  </tr>
                          )}
                    </tbody>
      </table>
      </div>

      <div className="py-10">
      <h1 className="text-blue-800 font-semibold text-xl">Corporate Management</h1>
      <table className="w-full table-auto border">
                    <thead className='bg-blue-200'>
                        <tr className="">
                            <th className="px-3 py-2 text-left min-w-24">Profile ID</th>
                            <th className="px-3 py-2 text-left min-w-32">Name</th>
                            <th className="px-3 py-2 text-left">Designation</th>
                            <th className="px-3 py-2 text-center">Description</th>
                            <th className="px-3 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coopData.length > 0 ? (
                          coopData.map( (profile, index) => (
                            <tr className='h-full odd:bg-blue-50 even:bg-blue-100 col-span-6' key={index}>
                              <th className="py-2 px-3 text-center">{profile.id}</th>
                                <td className="py-2 px-3">
                                  <div className="max-h-32 max-w-64 overflow-y-auto">
                                    {selectedLang === 'en' ? profile.name_en : selectedLang === 'si' ? profile.name_si : profile.name_ta}
                                    </div>

                                </td>
                                <td className="py-2 px-3">
                                  <div className="max-h-32 max-w-64 overflow-y-auto">
                                    {selectedLang === 'en' ? profile.designation_en : selectedLang === 'si' ? profile.designation_si : profile.designation_ta}
                                    </div>
                                </td>
                                {/* ✅ Display JSON array properly */}
                                <td className=" flex flex-row py-2 px-3">
                                  <div className='flex flex-col gap-y-2 max-h-32 max-w-auto overflow-y-auto'>
                                  {selectedLang === 'en' ? profile.description_en?.map((desc, i) => (
                                    <div key={i} className="flex items-start">
                                      <span className="text-sm leading-relaxed">{desc}</span>
                                    </div>
                                  )) : selectedLang === 'si' ? profile.description_si?.map((desc, i) => (
                                    <div key={i} className="flex items-start">
                                      <span className="text-sm leading-relaxed">{desc}</span>
                                    </div>
                                  )) : profile.description_ta?.map((desc, i) => (
                                    <div key={i} className="flex items-start">
                                      <span className="text-sm leading-relaxed">{desc}</span>
                                    </div>
                                  )) || <span className="text-gray-400 text-sm">No description available</span>}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center min-w-36">
                                  <div className='flex flex-row justify-center items-center'>
                                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2" 
                                     onClick={() => handleUpdateClick(profile)}
                                      >
                                      Edit
                                    </button>
                                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                                      onClick={() => handleDeleteClick(profile.id, 'coop')}
                                      > 
                                      <Trash2/>
                                    </button>
                                  </div>
                                </td>
                            </tr>
                            
                            ))
                          ) : (
                            <tr>
                                    <td colSpan="5" className="text-center border border-gray-300 px-4 py-2 text-gray-500">
                                      No data available
                                    </td>
                                  </tr>
                          )}
                    </tbody>
      </table>
      </div>

      {/* Render Popup only when isPopupOpen is true */}
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
  )
}

export default GetProfileDetails
