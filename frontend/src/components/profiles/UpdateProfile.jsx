import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import { Trash2 } from "lucide-react";
import UploadCard from "../UploadCard";

function UpdateProfile ({ isOpen, onClose, id, initialName, initialType, initialDesignation, initialDescription, tokenUrl, lang }) {
  const [name, setName] = useState(initialName || "");
  const [type, setType] = useState(initialType || "");
  const [designation, setDesignation] = useState(initialDesignation || "");
  const [description, setDescription] = useState(() => {
    if (Array.isArray(initialDescription) && initialDescription.length > 0) {
      return initialDescription;
    }
    return [""];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Update state when props change
  useEffect(() => {
    setName(initialName || "");
    setType(initialType || "");
    setDesignation(initialDesignation || "");
    // Ensure description is always an array
    if (Array.isArray(initialDescription)) {
      setDescription(initialDescription.length > 0 ? initialDescription : [""]);
    } else {
      setDescription([initialDescription || ""]);
    }
  }, [initialName, initialType, initialDesignation, initialDescription]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await axios.get(tokenUrl, {
          withCredentials: true 
        });
      } catch (err) {
        navigate("/login");
        console.log(err);
      }
    };

    fetchUser();
  }, [navigate, tokenUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out empty description lines before validation and submission
    const cleanedDescription = description.filter(desc => desc.trim() !== "");
    
    if (!type || !name || !designation || cleanedDescription.length === 0) {
      setError("All fields must be filled, including at least one description line.")
      return; // Prevent empty submission ✅
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/profile/updateProfile`,
        { id: id, lang: lang, type: type, name: name, designation: designation, description: cleanedDescription }, 
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
        
      );
      console.log(res)
      setName("");
      setType("");
      setDesignation("");
      setDescription([""]); 
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

  // Add new description field
  const handleAddDescription = () => {
    setDescription([...description, ""]);
  };

  // Update description array
  const handleDescriptionChange = (index, value) => {
    const newDescription = [...description];
    newDescription[index] = value;
    setDescription(newDescription);
  };

  // Remove a description field
  const handleRemoveDescription = (index) => {
    if (description.length > 1) {
      setDescription(description.filter((_, i) => i !== index));
    }
  };

  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 h-auto">
      <div className="flex flex-col bg-white p-6 rounded-md shadow-lg w-3/4">
        <h2 className="text-lg text-blue-900 font-semibold mb-4">Edit Profile</h2>
        
        {error && <p className="text-red-500">{error}</p>}

        <div className="mb-4">
            <UploadCard
            label={`Profile Picture`}
            uploadUrl={`${import.meta.env.VITE_API_BASE_URL}/fileUpload/upload/image`}
            acceptedTypes="image/webp"
            maxSizeMB={2}
            customFileName={`${id}.webp`}
            customDirectory={`media/aboutPage/${initialType || type || 'profiles'}`}
            onUploadSuccess={(data) => console.log(`Uploaded profile picture successfully!`, data)}
            onUploadError={(error) => {
              console.error(`Upload failed:`, error);
              setError(`Image upload failed: ${error.message || 'Unknown error'}`);
            }}
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-blue-700">Profile Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300 bg-blue-100"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-blue-700">Designation</label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300 bg-blue-100"
              required
            />
          </div>

          <div>
            <label className="block text-blue-700 mb-2">Description</label>
              {description.map((desc, index) => (
                <div key={index} className="flex items-center gap-2 mb-3">
                  <textarea
                    value={desc}
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    className="w-full p-2 border rounded text-sm border-blue-300 bg-blue-100"
                    placeholder={`Enter description line ${index + 1}`}
                    rows={2}
                    required
                  />
                  {description.length > 1 && (
                    <button
                      type="button"
                        onClick={() => handleRemoveDescription(index)}
                        className="p-2 text-red-500 hover:text-red-700 flex-shrink-0"
                        title="Remove this line"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddDescription}
                className="bg-amber-400 text-white px-3 py-2 rounded hover:bg-amber-500 mb-4"
              >
                + Add New Line
              </button>
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

UpdateProfile.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialName: PropTypes.string,
  initialType: PropTypes.string,
  initialDesignation: PropTypes.string,
  initialDescription: PropTypes.array,
  id: PropTypes.number.isRequired,
  tokenUrl: PropTypes.string.isRequired,
  lang: PropTypes.string.isRequired
};

export default UpdateProfile;
