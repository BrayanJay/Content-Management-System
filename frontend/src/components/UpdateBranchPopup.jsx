import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import UploadCard from "./UploadCard";

function UpdateBranchPopup({ isOpen, onClose, branch, tokenUrl, onUpdate }) {
  const [branchNameEn, setBranchNameEn] = useState("");
  const [branchNameSi, setBranchNameSi] = useState("");
  const [branchNameTa, setBranchNameTa] = useState("");
  
  const [branchAddressEn, setBranchAddressEn] = useState("");
  const [branchAddressSi, setBranchAddressSi] = useState("");
  const [branchAddressTa, setBranchAddressTa] = useState("");
  
  const [regionNameEn, setRegionNameEn] = useState("");
  const [regionNameSi, setRegionNameSi] = useState("");
  const [regionNameTa, setRegionNameTa] = useState("");
  
  const [regionId, setRegionId] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [coordinatesLongitude, setCoordinatesLongitude] = useState("");
  const [coordinatesLatitude, setCoordinatesLatitude] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  // Region options
  const regionOptions = [
    { id: 'HEAD_OFFICE', name: 'Head Office' },
    { id: 'WESTERN_REGION', name: 'Western Region' },
    { id: 'SOUTHERN_REGION', name: 'Southern Region' },
    { id: 'EASTERN_REGION', name: 'Eastern Region' },
    { id: 'NORTHERN_REGION', name: 'Northern Region' },
    { id: 'CENTRAL_REGION', name: 'Central Region' },
    { id: 'NORTH-WESTERN_REGION', name: 'North-Western Region' },
    { id: 'UVA_REGION', name: 'Uva Region' },
    { id: 'SABARAGAMUWA_REGION', name: 'Sabaragamuwa Region' },
  ];

  // Initialize form with branch data
  useEffect(() => {
    if (branch) {
      // Get full branch data first
      const fetchFullBranchData = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/branch/branches/details/${branch.id}`,
            { withCredentials: true }
          );
          const fullBranch = response.data;
          
          setBranchNameEn(fullBranch.branch_name_en || "");
          setBranchNameSi(fullBranch.branch_name_si || "");
          setBranchNameTa(fullBranch.branch_name_ta || "");
          
          setBranchAddressEn(fullBranch.branch_address_en || "");
          setBranchAddressSi(fullBranch.branch_address_si || "");
          setBranchAddressTa(fullBranch.branch_address_ta || "");
          
          setRegionNameEn(fullBranch.region_name_en || "");
          setRegionNameSi(fullBranch.region_name_si || "");
          setRegionNameTa(fullBranch.region_name_ta || "");
          
          setRegionId(fullBranch.region_id || "");
          setContactNumber(fullBranch.contact_number || "");
          setEmail(fullBranch.email || "");
          setCoordinatesLongitude(fullBranch.coordinates_longitude || "");
          setCoordinatesLatitude(fullBranch.coordinates_latitude || "");
        } catch (error) {
          console.error("Error fetching full branch data:", error);
          // Fallback to branch prop data
          setBranchNameEn(branch.branch_name || "");
          setBranchAddressEn(branch.branch_address || "");
          setRegionNameEn(branch.region_name || "");
          setRegionId(branch.region_id || "");
          setContactNumber(branch.contact_number || "");
          setEmail(branch.email || "");
          setCoordinatesLongitude(branch.coordinates_longitude || "");
          setCoordinatesLatitude(branch.coordinates_latitude || "");
        }
      };

      fetchFullBranchData();
    }
  }, [branch]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await axios.get(tokenUrl, { withCredentials: true });
      } catch (err) {
        navigate("/login");
        console.log(err);
      }
    };

    fetchUser();
  }, [navigate, tokenUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!branchNameEn || !branchNameSi || !branchNameTa || 
        !branchAddressEn || !branchAddressSi || !branchAddressTa ||
        !regionNameEn || !regionNameSi || !regionNameTa ||
        !regionId || !contactNumber || !email || 
        !coordinatesLongitude || !coordinatesLatitude) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/branch/branches/update/${branch.id}`,
        {
          region_id: regionId,
          branch_name_en: branchNameEn,
          branch_name_si: branchNameSi,
          branch_name_ta: branchNameTa,
          branch_address_en: branchAddressEn,
          branch_address_si: branchAddressSi,
          branch_address_ta: branchAddressTa,
          region_name_en: regionNameEn,
          region_name_si: regionNameSi,
          region_name_ta: regionNameTa,
          contact_number: contactNumber,
          email: email,
          coordinates_longitude: coordinatesLongitude,
          coordinates_latitude: coordinatesLatitude,
        },
        { 
          withCredentials: true, 
          headers: { "Content-Type": "application/json" } 
        }
      );

      onClose();
      if (onUpdate) onUpdate();
      alert("Branch updated successfully!");
      
    } catch (err) {
      console.error("Update failed:", err);
      setError(err.response?.data?.message || "Failed to update branch");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${branchNameEn}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    setError("");

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/branch/branches/delete/${branch.id}`,
        { withCredentials: true }
      );

      alert("Branch deleted successfully!");
      onClose();
      if (onUpdate) onUpdate();
      
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err.response?.data?.message || "Failed to delete branch");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800">Edit Branch Information</h2>
          <p className="text-sm text-gray-600 mt-1">Update branch details and media</p>
        </div>
        
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Media Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Branch Media</h3>
            <UploadCard
              label="Branch Image"
              uploadUrl={`${import.meta.env.VITE_API_BASE_URL}/fileUpload/upload/image`}
              acceptedTypes="image/png,image/webp"
              maxSizeMB={1}
              customFileName={`${branchNameEn.toLowerCase().replace(/\s+/g, '').replace(/_+/g, '')}.webp`}
              customDirectory="media/branches"
              onUploadSuccess={(data) => console.log("Uploaded!", data)}
            />
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Branch Information</h3>
              
              {/* Region Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Region</label>
                <select
                  value={regionId}
                  onChange={(e) => setRegionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  required
                >
                  <option value="">Select Region</option>
                  {regionOptions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch Names */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Branch Name (English)</label>
                  <input
                    type="text"
                    value={branchNameEn}
                    onChange={(e) => setBranchNameEn(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="Enter branch name in English"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Branch Name (Sinhala)</label>
                  <input
                    type="text"
                    value={branchNameSi}
                    onChange={(e) => setBranchNameSi(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="සිංහල නම"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Branch Name (Tamil)</label>
                  <input
                    type="text"
                    value={branchNameTa}
                    onChange={(e) => setBranchNameTa(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="தமிழ் பெயர்"
                    required
                  />
                </div>
              </div>

              {/* Addresses */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Address (English)</label>
                  <textarea
                    value={branchAddressEn}
                    onChange={(e) => setBranchAddressEn(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="Enter complete address in English"
                    rows="2"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Address (Sinhala)</label>
                  <textarea
                    value={branchAddressSi}
                    onChange={(e) => setBranchAddressSi(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="සිංහල ලිපිනය"
                    rows="2"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Address (Tamil)</label>
                  <textarea
                    value={branchAddressTa}
                    onChange={(e) => setBranchAddressTa(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="தமிழ் முகவரி"
                    rows="2"
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="0712345678"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="branch@aaf.lk"
                    required
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    type="text"
                    value={coordinatesLatitude}
                    onChange={(e) => setCoordinatesLatitude(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="6.1234567"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    type="text"
                    value={coordinatesLongitude}
                    onChange={(e) => setCoordinatesLongitude(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="80.1234567"
                    required
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex flex-wrap gap-3 justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isDeleting || loading}
            >
              {isDeleting ? "Deleting..." : "Delete Branch"}
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                disabled={loading || isDeleting}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading || isDeleting}
              >
                {loading ? "Updating..." : "Update Branch"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
UpdateBranchPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  branch: PropTypes.shape({
    id: PropTypes.number.isRequired,
    branch_name: PropTypes.string,
    branch_address: PropTypes.string,
    region_name: PropTypes.string,
    region_id: PropTypes.string,
    contact_number: PropTypes.string,
    email: PropTypes.string,
    coordinates_longitude: PropTypes.string,
    coordinates_latitude: PropTypes.string,
  }).isRequired,
  tokenUrl: PropTypes.string.isRequired,
  onUpdate: PropTypes.func,
};

export default UpdateBranchPopup;
  