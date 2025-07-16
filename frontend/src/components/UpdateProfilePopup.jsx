import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import { Trash2 } from "lucide-react";

function UpdateProfilePopup ({ isOpen, onClose, initialLang, initialProfile_name, initialDesignation, initialDescription, id,  tokenUrl }) {
  const [profile_name, setprofile_name] = useState(initialProfile_name || "");
  const [designation, setDesignation] = useState(initialDesignation || "");
  const [description, setDescription] = useState(initialDescription || [""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

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

    if (!profile_name || !designation || !description) {
      setError("Fields cannot be empty.")
      return; // Prevent empty submission ✅
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.put(`http://localhost:3000/profile/update/profile/${id}`, //http://localhost/aaf-cms-backend/api/update_profile.php?id=${id}
        { profile_name, designation, description, lang: initialLang }, 
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
        
      );
      console.log(res)
      setprofile_name("");
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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-blue-700">Profile Name</label>
            <input
              type="text"
              value={profile_name}
              onChange={(e) => setprofile_name(e.target.value)}
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
            <label className="block text-blue-700">Description:</label>
              {description.map((desc, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <textarea
                    value={desc}
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    className="w-full p-2 border rounded text-sm border-blue-300 bg-blue-100"
                    placeholder="Enter description"
                    required
                  />
                  {description.length > 1 && (
                    <button
                      type="button"
                        onClick={() => handleRemoveDescription(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddDescription}
                className="bg-amber-400 text-white px-2 py-1 rounded hover:bg-amber-500 mb-2"
              >
                + New Line
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

UpdateProfilePopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialLang: PropTypes.string.isRequired,
  initialProfile_name: PropTypes.string,
  initialDesignation: PropTypes.string,
  initialDescription: PropTypes.array,
  id: PropTypes.number.isRequired,
  tokenUrl: PropTypes.string.isRequired,
};

export default UpdateProfilePopup;
