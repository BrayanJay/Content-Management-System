import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import UploadCard from "./UploadCard";

function UpdateBranchPopup ({ isOpen, onClose, initialLang, initialBranchName, initialRegion, initialAddress, initialLongitude, initialLatitude, initialContact, id,  tokenUrl }) {
  const [branchName, setBranchName] = useState(initialBranchName || "");
  const [region, setRegion] = useState(initialRegion || "");
  const [address, setAddress] = useState(initialAddress || "");
  const [longitude, setLongitude] = useState(initialLongitude || "");
  const [latitude, setLatitude] = useState(initialLatitude || "");
  const [contact, setContact] = useState(initialContact || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

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

    if (!branchName || !region || !address || !longitude || !latitude || !contact) {
      setError("Fields cannot be empty.")
      return; // Prevent empty submission ✅
    }

    setLoading(true);
    setError("");

    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/branch/updateBranch/${id}`, 
        { branch_name: branchName, region, address, longitude, latitude, contact, lang: initialLang }, 
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      setBranchName("");
      setRegion("");
      setAddress("");
      setLongitude("");
      setLatitude("");
      setContact("");
      onClose();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error("Update failed:", err);
      setError(err.response?.data?.message || "Failed to update values");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null; // Don't render if not open

  return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 h-auto">
        <div className="flex flex-col bg-white p-6 rounded-md shadow-lg w-3/4">
          <h2 className="text-lg text-blue-900 font-semibold mb-4">Edit Profile</h2>
          
          {error && <p className="text-red-500">{error}</p>}
  
          <div className="flex flex-col gap-3 w-full py-10">
            <h1 className="text-blue-800 font-semibold text-xl">Popup Media</h1>
            {/* <PopupToggle tokenUrl={tokenUrl}/> */}
            <UploadCard
              label="Branch Image"
              uploadUrl={`${import.meta.env.VITE_API_BASE_URL}/fileUpload/upload/image`}
              acceptedTypes="image/png,image/webp"
              maxSizeMB={1}
              customFileName={`${initialBranchName.toLowerCase().replace(/\s+/g, '').replace(/_+/g, '')}.webp`}
              customDirectory="media/branches"
              onUploadSuccess={(data) => console.log("Uploaded!", data)}
            />
          </div>

          <form onSubmit={handleSubmit}>

            <div className="mb-4">
              <label className="block text-slate-700">Branch Name</label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full p-2 border rounded-md text-sm border-blue-300 "
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-slate-700">Region</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full p-2 border rounded-md text-sm border-blue-300 "
                required
              />
            </div>
  
            <div className="mb-4">
              <label className="block text-slate-700">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 border rounded-md text-sm border-blue-300 "
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-slate-700">Latitude</label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full p-2 border rounded-md text-sm border-blue-300 "
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-slate-700">Longitude</label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full p-2 border rounded-md text-sm border-blue-300 "
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-slate-700">Contact No</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full p-2 border rounded-md text-sm border-blue-300 "
                required
              />
            </div>
  
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                {loading ? "Updating..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  UpdateBranchPopup.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    initialLang: PropTypes.string.isRequired,
    initialBranchName: PropTypes.string,
    initialRegion: PropTypes.string,
    initialAddress: PropTypes.string,
    initialLongitude: PropTypes.string,
    initialLatitude: PropTypes.string,
    initialContact: PropTypes.string,
    id: PropTypes.number.isRequired,
    tokenUrl: PropTypes.string.isRequired,
  };
  
  export default UpdateBranchPopup;
  