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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-24 px-10">
        {/* Add New Profile Form */}
      <div className="w-full max-w-screen-lg p-4 bg-white border-blue-600 border hover:shadow-lg transition-all ease-in-out duration-300 rounded-lg shadow-sm sm:p-6">
        <h1 className="text-lg font-bold text-blue-600 underline pb-1">Add New Profile</h1>
        
        {/* Progress Indicator */}
        <div className={`flex items-center mb-6 mt-4 ${createdProfileId ? 'bg-blue-50 p-4 rounded-lg border border-blue-200' : ''}`}>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${!createdProfileId ? 'bg-blue-600' : 'bg-green-600'}`}>
              {!createdProfileId ? '1' : '✓'}
            </div>
            <span className={`ml-2 font-medium ${!createdProfileId ? 'text-blue-600' : 'text-green-600'}`}>
              Create Profile
            </span>
          </div>
          
          <div className={`flex-1 h-1 mx-4 ${createdProfileId ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${!createdProfileId ? 'bg-gray-400' : !imageUploaded ? 'bg-blue-600' : 'bg-green-600'}`}>
              {!createdProfileId ? '2' : !imageUploaded ? '2' : '✓'}
            </div>
            <span className={`ml-2 font-medium ${!createdProfileId ? 'text-gray-400' : !imageUploaded ? 'text-blue-600' : 'text-green-600'}`}>
              Upload Image
            </span>
          </div>
          
          <div className={`flex-1 h-1 mx-4 ${imageUploaded ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${!imageUploaded ? 'bg-gray-400' : 'bg-green-600'}`}>
              {!imageUploaded ? '3' : '✓'}
            </div>
            <span className={`ml-2 font-medium ${!imageUploaded ? 'text-gray-400' : 'text-green-600'}`}>
              Complete
            </span>
          </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}
  
        {/* Profile Form - Only show if profile hasn't been created yet */}
        {!createdProfileId && (
        <form onSubmit={handleSubmit}>

          {/* Select Profile Type */}
          <div className="relative w-full max-w-md py-4">
            <span>Profile Type</span>
            <select
              className="w-full px-3 py-2 border rounded-md bg-white cursor-pointer justify-between flex items-center"
              onChange={(e) => setType(e.target.value)}
              value={type}
            >
              <option value="bod">Board of Director</option>
              <option value="coop">Corporate Management</option>
            </select>
          </div>

          <h2 className="text-base font-semibold text-blue-800 pb-1">In English</h2>
          
          {/* Profile Name - English */}
          <div className="mb-4">
            <label className="block text-slate-700">Profile Name (EN)</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          {/* Profile Designation - English */}
          <div className="mb-4">
            <label className="block text-slate-700">Designation (EN)</label>
            <input
              type="text"
              value={designationEn}
              onChange={(e) => setDesignationEn(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          {/* Profile Description - English */}
          <div>
            <label className="block text-slate-700">Description (EN)</label>
              {descriptionEn.map((desc, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <textarea
                    value={desc}
                    onChange={(e) => handleDescriptionChange("en", index, e.target.value)}
                    className="w-full p-2 border rounded text-sm border-blue-300"
                    placeholder="Enter description"
                    required
                  />
                  {descriptionEn.length > 1 && (
                    <button
                      type="button"
                        onClick={() => handleRemoveDescription("en", index)}
                        className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddDescription("en")}
                className="bg-amber-400 text-white px-2 py-1 rounded hover:bg-amber-500 mb-2"
              >
                + New Line
              </button>
          </div>

          <h2 className="text-base font-semibold text-blue-800 pb-1">In Sinhala</h2>

          {/* Profile Name - Sinhala */}
          <div className="mb-4">
            <label className="block text-slate-700">Profile Name (SI)</label>
            <input
              type="text"
              value={nameSi}
              onChange={(e) => setNameSi(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          {/* Profile Designation - Sinhala */}
          <div className="mb-4">
            <label className="block text-slate-700">Designation (SI)</label>
            <input
              type="text"
              value={designationSi}
              onChange={(e) => setDesignationSi(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          {/* Profile Description - Sinhala */}
          <div className="mb-4">
            <label className="block text-slate-700">Description (SI)</label>
            {descriptionSi.map((desc, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <textarea
                  value={desc}
                  onChange={(e) => handleDescriptionChange("si", index, e.target.value)}
                  className="w-full p-2 border rounded text-sm border-blue-300"
                  placeholder="Enter description"
                  required
                />
                {descriptionSi.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDescription("si", index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddDescription("si")}
              className="bg-amber-400 text-white px-2 py-1 rounded hover:bg-amber-500 mb-2"
            >
              + New Line
            </button>
          </div>

          <h2 className="text-base font-semibold text-blue-800 pb-1">In Tamil</h2>

          {/* Profile Name - Tamil */}
          <div className="mb-4">
            <label className="block text-slate-700">Profile Name (TA)</label>
            <input
              type="text"
              value={nameTa}
              onChange={(e) => setNameTa(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          {/* Profile Designation - Tamil */}
          <div className="mb-4">
            <label className="block text-slate-700">Designation (TA)</label>
            <input
              type="text"
              value={designationTa}
              onChange={(e) => setDesignationTa(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          {/* Profile Description - Tamil */}
          <div className="mb-4">
            <label className="block text-slate-700">Description (TA)</label>
            {descriptionTa.map((desc, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <textarea
                  value={desc}
                  onChange={(e) => handleDescriptionChange("ta", index, e.target.value)}
                  className="w-full p-2 border rounded text-sm border-blue-300"
                  placeholder="Enter description"
                  required
                />
                {descriptionTa.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDescription("ta", index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddDescription("ta")}
              className="bg-amber-400 text-white px-2 py-1 rounded hover:bg-amber-500 mb-2"
            >
              + New Line
            </button>
          </div>
          
          {/* Button Section */}
          <div className="flex justify-end gap-2.5">

            {/* Submit Button */}
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
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
              className="px-4 py-2 hover:border-blue-800 border-2 border-blue-600 text-blue-600 hover:text-blue-800 rounded-md"
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
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Profile Created Successfully!</h3>
                  <p className="text-green-600">Profile and image have been uploaded successfully.</p>
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
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold"
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