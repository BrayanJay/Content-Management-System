import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BiChevronDown } from "react-icons/bi";
import { CiSearch, CiMap } from "react-icons/ci";
import { FaBuildingColumns, FaLocationDot, FaChartArea } from "react-icons/fa6";
import { IoCall, IoMail } from "react-icons/io5";
import { MdDriveFileRenameOutline } from "react-icons/md";
import UpdateBranchPopup from "../components/UpdateBranchPopup";

const BranchNetwork = () => {
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null); // Store the ID to maintain selection across language changes
  const [selectedLang, setSelectedLang] = useState("en");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [regionStats, setRegionStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tokenUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/branchdetails`;
  const navigate = useNavigate();

  // Fetch branches data
  const fetchBranches = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/branch/branches/lang/${selectedLang}`,
        { withCredentials: true }
      );
      setBranches(response.data);
      setFilteredBranches(response.data);
      
      // If we have a selected branch ID, find and update the selected branch in the new language
      if (selectedBranchId && response.data.length > 0) {
        const translatedBranch = response.data.find(branch => branch.id === selectedBranchId);
        if (translatedBranch) {
          setSelectedBranch(translatedBranch);
          setSearch(translatedBranch.branch_name);
        }
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      throw error;
    }
  }, [selectedLang, selectedBranchId, navigate]);

  // Fetch region statistics
  const fetchRegionStats = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/branch/branches/stats/regions`,
        { withCredentials: true }
      );
      setRegionStats(response.data);
    } catch (error) {
      console.error("Error fetching region stats:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      throw error;
    }
  }, [navigate]);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user authentication
        await axios.get(tokenUrl, {
          withCredentials: true,
        });

        // Fetch data in parallel
        await Promise.all([
          fetchBranches(),
          fetchRegionStats()
        ]);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to load branch data. Please try again.");
        }
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [navigate, tokenUrl, selectedLang, selectedBranchId, fetchBranches, fetchRegionStats]);

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setFilteredBranches(
      branches.filter((branch) =>
        branch.branch_name.toLowerCase().startsWith(value.toLowerCase())
      )
    );
  };

  // Select a branch from the dropdown
  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
    setSelectedBranchId(branch.id); // Store the ID to maintain selection across language changes
    setSearch(branch.branch_name);
    setDropdownOpen(false);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRemoveBranch = async () => {
    if (!selectedBranch) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${selectedBranch?.branch_name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/branch/branches/delete/${selectedBranch.id}`,
        { withCredentials: true }
      );

      // Reset selected branch and details
      setSelectedBranch(null);
      setSelectedBranchId(null); // Clear the stored ID
      setSearch("");

      // Refresh the branches list
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/branch/branches/lang/${selectedLang}`,
        { withCredentials: true }
      );
      setBranches(response.data);
      setFilteredBranches(response.data);

      alert("Branch deleted successfully!");

    } catch (err) {
      console.error("Error deleting branch:", err);
      alert(err.response?.data?.message || "Failed to delete branch");
    } finally {
      setIsDeleting(false);
    }
  };

  // Format region name for display
  const formatRegionName = (regionId) => {
    return regionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get branch image URL
  const getBranchImageUrl = (branchNameEn) => {
    if (!branchNameEn) return null;
    // Convert to lowercase and replace spaces with empty string, keep only alphanumeric characters
    const imageName = branchNameEn
      .toLowerCase()
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric characters
    
    return `${import.meta.env.VITE_API_BASE_URL}/media/branches/${imageName}.webp`;
  };
  

  return (
    <div className="p-4 md:p-6 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading branch network data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Page Header with Region Statistics */}
        {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Branch Network Management</h1>
          

          
          {/* Branch Selection and Language Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Branch Selection Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Select Branch</label>
              <div className="relative" ref={dropdownRef}>
                <div
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white cursor-pointer flex items-center justify-between hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-colors"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="text-gray-900">{selectedBranch?.branch_name || "Select Branch"}</span>
                  <BiChevronDown className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {dropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="flex items-center border-b border-gray-200 px-3 py-2">
                      <CiSearch className="text-gray-400 mr-2" />
                      <input
                        type="text"
                        value={search}
                        onChange={handleSearch}
                        placeholder="Search branches..."
                        className="w-full py-1 text-sm focus:outline-none"
                      />
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                      {filteredBranches.length > 0 ? (
                        filteredBranches.map((branch) => (
                          <li
                            key={branch.id}
                            onClick={() => handleSelectBranch(branch)}
                            className="px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{branch.branch_name}</span>
                              <span className="text-xs text-gray-500">{formatRegionName(branch.region_id)}</span>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-3 text-gray-500">No branches found</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Display Language</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                onChange={(e) => setSelectedLang(e.target.value)}
                value={selectedLang}
              >
                <option value="en">English</option>
                <option value="si">Sinhala</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
          </div>
        </div>
        )}

        {/* Display Selected Branch Details */}
        {!loading && !error && selectedBranch && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <FaBuildingColumns className="text-blue-600 text-xl" />
              <h2 className="text-xl font-bold text-gray-800">Branch Details</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                {formatRegionName(selectedBranch.region_id)}
              </span>
            </div>

            {/* Branch Image */}
            {selectedBranch.branch_name_en && (
              <div className="mb-6">
                <div className="relative max-w-80 overflow-hidden bg-gray-100">
                  <img
                    src={getBranchImageUrl(selectedBranch.branch_name_en)}
                    alt={`${selectedBranch.branch_name} Branch`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="absolute inset-0 bg-gray-200 items-center justify-center"
                    style={{ display: 'none' }}
                  >
                    <div className="text-center text-gray-500">
                      <FaBuildingColumns className="mx-auto text-4xl mb-2" />
                      <p className="text-sm">Branch Image Not Available</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Branch Name */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <MdDriveFileRenameOutline className="text-blue-600 text-lg mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Branch Name</p>
                  <p className="text-gray-900 font-semibold">{selectedBranch.branch_name}</p>
                </div>
              </div>

              {/* Region */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <FaChartArea className="text-blue-600 text-lg mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Region</p>
                  <p className="text-gray-900 font-semibold">{selectedBranch.region_name}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <IoCall className="text-blue-600 text-lg mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Contact</p>
                  <p className="text-gray-900 font-semibold">{selectedBranch.contact_number}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <IoMail className="text-blue-600 text-lg mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900 font-semibold">{selectedBranch.email}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                <FaLocationDot className="text-blue-600 text-lg mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Address</p>
                  <p className="text-gray-900 font-semibold">{selectedBranch.branch_address}</p>
                </div>
              </div>

              {/* Coordinates */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <CiMap className="text-blue-600 text-lg mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Coordinates</p>
                  <p className="text-gray-900 font-semibold">
                    {selectedBranch.coordinates_latitude}, {selectedBranch.coordinates_longitude}
                  </p>
                </div>
              </div>
            </div>

            {/* Last Updated Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Last updated: {new Date(selectedBranch.last_updated_time).toLocaleString()} by {selectedBranch.last_updated_by}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setIsPopupOpen(true)}
              >
                Edit Branch
              </button>
              <button
                className="border-2 border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 hover:text-red-600 font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleRemoveBranch}
                disabled={isDeleting}
              >
                {isDeleting ? "Removing..." : "Remove Branch"}
              </button>
            </div>
          </div>
        )}

        {/* Add New Branch Section */}
        {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FaBuildingColumns className="text-blue-600 text-xl" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Add New Branch</h2>
                <p className="text-gray-600 text-sm">Create a new branch with complete details and image</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/branches/add')}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <FaBuildingColumns className="w-4 h-4" />
              Add New Branch
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">i</div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Multi-step Process:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Enter branch details in all languages (English, Sinhala, Tamil)</li>
                  <li>Add location coordinates and contact information</li>
                  <li>Upload branch picture</li>
                  <li>Review and confirm</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Update Branch Popup */}
        {!loading && !error && isPopupOpen && selectedBranch && (
          <UpdateBranchPopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            branch={selectedBranch}
            tokenUrl={tokenUrl}
            onUpdate={() => {
              // Refresh branches after update
              const fetchBranches = async () => {
                try {
                  const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/branch/branches/lang/${selectedLang}`,
                    { withCredentials: true }
                  );
                  setBranches(response.data);
                  setFilteredBranches(response.data);
                  
                  // Update selected branch if it's still in the list
                  const updatedBranch = response.data.find(b => b.id === selectedBranch.id);
                  if (updatedBranch) {
                    setSelectedBranch(updatedBranch);
                    setSelectedBranchId(updatedBranch.id); // Ensure ID is maintained
                    setSearch(updatedBranch.branch_name);
                  }
                } catch (error) {
                  console.error("Error fetching updated branches:", error);
                  if (error.response?.status === 401) {
                    navigate("/login");
                  }
                }
              };
              fetchBranches();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BranchNetwork;