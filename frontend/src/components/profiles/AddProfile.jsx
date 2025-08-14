import axios from "axios";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadCard from "../UploadCard";

const AddProfile = () => {
    
    //New Profile Values
    const [type, setType] = useState("bod");
    const [nameEn, setNameEn] = useState("");
    const [nameSi, setNameSi] = useState("");
    const [nameTa, setNameTa] = useState("");
    const [designationEn, setDesignationEn] = useState("");
    const [designationSi, setDesignationSi] = useState("");
    const [designationTa, setDesignationTa] = useState("");
    const [descriptionEn, setDescriptionEn] = useState([""]);
    const [descriptionSi, setDescriptionSi] = useState([""]);
    const [descriptionTa, setDescriptionTa] = useState([""]);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [createdProfileId, setCreatedProfileId] = useState(null);
    const [imageUploaded, setImageUploaded] = useState(false);

    const tokenUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/aboutpagecontents`;
    const navigate = useNavigate();

    // Fetch user authentication
    const fetchUser = useCallback(async () => {
        try {
        await axios.get(tokenUrl, {
            withCredentials: true,
        });
        } catch (err) {
        navigate("/login");
        console.log(err);
        }
    }, [tokenUrl, navigate]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  //Add new profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!type || !nameEn || !nameSi || !nameTa || !designationEn || !designationSi || !designationTa || 
        !descriptionEn.length || !descriptionSi.length || !descriptionTa.length ||
        descriptionEn.some(desc => !desc.trim()) || descriptionSi.some(desc => !desc.trim()) || descriptionTa.some(desc => !desc.trim())) {
      setError("All fields in all languages are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Add profile details
      const profileData = {
        type,
        nameEn,
        nameSi, 
        nameTa,
        designationEn,
        designationSi,
        designationTa,
        descriptionEn,
        descriptionSi,
        descriptionTa
      };

      console.log("Sending profile data:", profileData);

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/profile/addProfile`, 
        profileData, 
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      // Get the created profile ID from response
      const createdProfileId = response.data.profileId || response.data.id || response.data.data?.id;
      console.log("Profile created successfully with ID:", createdProfileId);

      // Store this ID in state for immediate use
      if (createdProfileId) {
        setCreatedProfileId(createdProfileId);
        // Don't reset form immediately - let user upload image first
        console.log("Profile created! You can now upload the profile picture with ID:", createdProfileId);
      } else {
        // Reset form if we don't have the ID
        setType("bod"); setNameEn(""); setNameSi(""); setNameTa("");
        setDesignationEn(""); setDesignationSi(""); setDesignationTa("");
        setDescriptionEn([""]); setDescriptionSi([""]); setDescriptionTa([""]);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => window.location.reload(), 500);
      }

    } catch (err) {
      console.error("Error adding profile:", err);
      //setError(err.response?.data?.message || "Failed to add profile");
      alert(err.response?.data?.message || "Failed to add profile");
    } finally {
      setLoading(false);
    }
  };

const handleReset = async (e) => {
  e.preventDefault();
  setType("");
  setNameEn("");
  setNameSi("");
  setNameTa("");
  setDesignationEn("");
  setDesignationSi("");
  setDesignationTa("");
  setDescriptionEn([""]);
  setDescriptionSi([""]);
  setDescriptionTa([""]);
  setCreatedProfileId(null);
  setImageUploaded(false);
};

  // Update description array
  const handleDescriptionChange = (lang, index, value) => {
    if (lang === "en") {
      const newDescription = [...descriptionEn];
      newDescription[index] = value;
      setDescriptionEn(newDescription);
    } else if (lang === "si") {
      const newDescription = [...descriptionSi];
      newDescription[index] = value;
      setDescriptionSi(newDescription);
    } else if (lang === "ta") {
      const newDescription = [...descriptionTa];
      newDescription[index] = value;
      setDescriptionTa(newDescription);
    }
  };

  // Add new description field
  const handleAddDescription = (lang) => {
    if (lang === "en") {
      setDescriptionEn([...descriptionEn, ""]);
    } else if (lang === "si") {
      setDescriptionSi([...descriptionSi, ""]);
    } else if (lang === "ta") {
      setDescriptionTa([...descriptionTa, ""]);
    }
  };

  // Remove a description field
  const handleRemoveDescription = (lang, index) => {
    if (lang === "en") {
      if (descriptionEn.length > 1) {
        setDescriptionEn(descriptionEn.filter((_, i) => i !== index));
      }
    } else if (lang === "si") {
      if (descriptionSi.length > 1) {
        setDescriptionSi(descriptionSi.filter((_, i) => i !== index));
      }
    } else if (lang === "ta") {
      if (descriptionTa.length > 1) {
        setDescriptionTa(descriptionTa.filter((_, i) => i !== index));
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-10">
        {/* Add New Profile Form */}
      <div className="w-full max-w-screen-xl p-4 sm:p-6 lg:p-8 bg-white border-blue-600 border hover:shadow-lg transition-all ease-in-out duration-300 rounded-lg shadow-sm">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 underline pb-2 sm:pb-4">Add New Profile</h1>
        
        {/* Progress Indicator */}
        <div className={`flex flex-col sm:flex-row items-center mb-6 mt-4 p-3 sm:p-4 rounded-lg ${createdProfileId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
          <div className="flex items-center mb-2 sm:mb-0">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold ${!createdProfileId ? 'bg-blue-600' : 'bg-green-600'}`}>
              {!createdProfileId ? '1' : '✓'}
            </div>
            <span className={`ml-2 text-sm sm:text-base font-medium ${!createdProfileId ? 'text-blue-600' : 'text-green-600'}`}>
              Create Profile
            </span>
          </div>
          
          <div className={`hidden sm:block flex-1 h-1 mx-4 ${createdProfileId ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          
          <div className="flex items-center mb-2 sm:mb-0">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold ${!createdProfileId ? 'bg-gray-400' : !imageUploaded ? 'bg-blue-600' : 'bg-green-600'}`}>
              {!createdProfileId ? '2' : !imageUploaded ? '2' : '✓'}
            </div>
            <span className={`ml-2 text-sm sm:text-base font-medium ${!createdProfileId ? 'text-gray-400' : !imageUploaded ? 'text-blue-600' : 'text-green-600'}`}>
              Upload Image
            </span>
          </div>
          
          <div className={`hidden sm:block flex-1 h-1 mx-4 ${imageUploaded ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          
          <div className="flex items-center">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold ${!imageUploaded ? 'bg-gray-400' : 'bg-green-600'}`}>
              {!imageUploaded ? '3' : '✓'}
            </div>
            <span className={`ml-2 text-sm sm:text-base font-medium ${!imageUploaded ? 'text-gray-400' : 'text-green-600'}`}>
              Complete
            </span>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm sm:text-base mb-4">{error}</p>}
  
        {/* Profile Form - Only show if profile hasn't been created yet */}
        {!createdProfileId && (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

          {/* Select Profile Type */}
          <div className="w-full max-w-md">
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Profile Type</label>
            <select
              className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md bg-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => setType(e.target.value)}
              value={type}
            >
              <option value="bod">Board of Director</option>
              <option value="coop">Corporate Management</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">In English</h2>
              
              {/* Profile Name - English */}
              <div>
                <label className="block text-sm sm:text-base text-slate-700 font-medium mb-1">Profile Name (EN)</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Profile Designation - English */}
              <div>
                <label className="block text-sm sm:text-base text-slate-700 font-medium mb-1">Designation (EN)</label>
                <input
                  type="text"
                  value={designationEn}
                  onChange={(e) => setDesignationEn(e.target.value)}
                  className="w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Profile Description - English */}
              <div>
                <label className="block text-sm sm:text-base text-slate-700 font-medium mb-2">Description (EN)</label>
                {descriptionEn.map((desc, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                    <textarea
                      value={desc}
                      onChange={(e) => handleDescriptionChange("en", index, e.target.value)}
                      className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Enter description"
                      rows={2}
                      required
                    />
                    {descriptionEn.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDescription("en", index)}
                        className="p-2 text-red-500 hover:text-red-700 self-end sm:self-center bg-red-50 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 size={18} className="sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddDescription("en")}
                  className="bg-amber-400 hover:bg-amber-500 text-white px-3 py-2 rounded text-sm sm:text-base font-medium transition-colors"
                >
                  + New Line
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">In Sinhala</h2>

              {/* Profile Name - Sinhala */}
              <div>
                <label className="block text-sm sm:text-base text-slate-700 font-medium mb-1">Profile Name (SI)</label>
                <input
                  type="text"
                  value={nameSi}
                  onChange={(e) => setNameSi(e.target.value)}
                  className="w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Profile Designation - Sinhala */}
              <div>
                <label className="block text-sm sm:text-base text-slate-700 font-medium mb-1">Designation (SI)</label>
                <input
                  type="text"
                  value={designationSi}
                  onChange={(e) => setDesignationSi(e.target.value)}
                  className="w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Profile Description - Sinhala */}
              <div>
                <label className="block text-sm sm:text-base text-slate-700 font-medium mb-2">Description (SI)</label>
                {descriptionSi.map((desc, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                    <textarea
                      value={desc}
                      onChange={(e) => handleDescriptionChange("si", index, e.target.value)}
                      className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Enter description"
                      rows={2}
                      required
                    />
                    {descriptionSi.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDescription("si", index)}
                        className="p-2 text-red-500 hover:text-red-700 self-end sm:self-center bg-red-50 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 size={18} className="sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddDescription("si")}
                  className="bg-amber-400 hover:bg-amber-500 text-white px-3 py-2 rounded text-sm sm:text-base font-medium transition-colors"
                >
                  + New Line
                </button>
              </div>
            </div>
          </div>

          {/* Tamil Section - Full Width */}
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">In Tamil</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profile Name - Tamil */}
              <div>
                <label className="block text-sm sm:text-base text-slate-700 font-medium mb-1">Profile Name (TA)</label>
                <input
                  type="text"
                  value={nameTa}
                  onChange={(e) => setNameTa(e.target.value)}
                  className="w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Profile Designation - Tamil */}
              <div>
                <label className="block text-sm sm:text-base text-slate-700 font-medium mb-1">Designation (TA)</label>
                <input
                  type="text"
                  value={designationTa}
                  onChange={(e) => setDesignationTa(e.target.value)}
                  className="w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Profile Description - Tamil */}
            <div>
              <label className="block text-sm sm:text-base text-slate-700 font-medium mb-2">Description (TA)</label>
              {descriptionTa.map((desc, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                  <textarea
                    value={desc}
                    onChange={(e) => handleDescriptionChange("ta", index, e.target.value)}
                    className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter description"
                    rows={2}
                    required
                  />
                  {descriptionTa.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDescription("ta", index)}
                      className="p-2 text-red-500 hover:text-red-700 self-end sm:self-center bg-red-50 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddDescription("ta")}
                className="bg-amber-400 hover:bg-amber-500 text-white px-3 py-2 rounded text-sm sm:text-base font-medium transition-colors"
              >
                + New Line
              </button>
            </div>
          </div>
          
          {/* Button Section */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm sm:text-base font-medium transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Adding..." : createdProfileId ? "Profile Created ✓" : "Add Profile"}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => {
                handleReset();
                navigate("/aboutPage");
              }}
              className="w-full sm:w-auto px-6 py-3 hover:border-blue-800 border-2 border-blue-600 text-blue-600 hover:text-blue-800 rounded-md text-sm sm:text-base font-medium transition-colors"
            >
              Cancel
            </button>

          </div>
          </form>
        )}

        {/* Show Created Profile Summary */}
        {createdProfileId && !imageUploaded && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-3">✓ Profile Created Successfully</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><span className="font-medium text-gray-700">Profile ID:</span> {createdProfileId}</p>
                <p><span className="font-medium text-gray-700">Type:</span> {type === 'bod' ? 'Board of Director' : 'Corporate Management'}</p>
                <p><span className="font-medium text-gray-700">Name:</span> {nameEn}</p>
                <p><span className="font-medium text-gray-700">Designation:</span> {designationEn}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Next Step:</p>
                <p className="text-blue-600">↓ Please upload the profile picture below</p>
              </div>
            </div>
          </div>
        )}

          {/* Upload Image Section - Only show after profile is created */}
          {createdProfileId && !imageUploaded && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Step 2: Upload Profile Picture
              </h3>
              <UploadCard
                label={`Profile Picture (ID: ${createdProfileId})`}
                uploadUrl={`${import.meta.env.VITE_API_BASE_URL}/fileUpload/upload/image`}
                acceptedTypes="image/webp"
                maxSizeMB={2}
                customFileName={`${createdProfileId}.webp`}
                customDirectory={`media/aboutPage/${type}`}
                onUploadSuccess={(data) => {
                  console.log(`Uploaded profile picture successfully!`, data);
                  setImageUploaded(true);
                }}
                onUploadError={(error) => {
                  console.error('Upload failed:', error);
                  setError(`Image upload failed: ${error.message || 'Unknown error'}`);
                }}
              />
            </div>
          )}

          {/* Complete & Reset Button - Only show after image is uploaded */}
          {createdProfileId && imageUploaded && (
            <div className="mt-6 p-4 sm:p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-green-800">Profile Created Successfully!</h3>
                  <p className="text-sm sm:text-base text-green-600">Profile and image have been uploaded successfully.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setType("bod"); setNameEn(""); setNameSi(""); setNameTa("");
                    setDesignationEn(""); setDesignationSi(""); setDesignationTa("");
                    setDescriptionEn([""]); setDescriptionSi([""]); setDescriptionTa([""]);
                    setCreatedProfileId(null);
                    setImageUploaded(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setTimeout(() => window.location.reload(), 500);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm sm:text-base font-semibold transition-colors"
                >
                  Complete & Add Another Profile
                </button>
              </div>
            </div>
          )}

          </div>
    </div>
  )
}



export default AddProfile