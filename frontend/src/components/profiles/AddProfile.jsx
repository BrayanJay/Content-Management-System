import axios from "axios";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/profile/addProfile`, 
        profileData, 
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      setType(""); setNameEn(""); setNameSi(""); setNameTa("");
      setDesignationEn(""); setDesignationSi(""); setDesignationTa("");
      setDescriptionEn([""]); setDescriptionSi([""]); setDescriptionTa([""]);

      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => window.location.reload(), 500);

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
        {error && <p className="text-red-500">{error}</p>}
  
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

          {/* <div className="mb-4">
            <label className="block text-slate-700">Description (EN)</label>
            <input
              type="text"
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div> */}

          <div>
            <label className="block text-blue-700">Description (EN)</label>
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

          <div className="flex justify-end gap-2.5">
            
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>

            <Link to="/aboutPage">
                <button
                type="reset"
                onClick={handleReset}
                className="px-4 py-2 hover:border-blue-800 border-2 border-blue-600 text-blue-600 hover:text-blue-800 rounded-md"
                >
                Cancel
                </button>
            </Link>

          </div>
          </form>
          </div>
    </div>
  )
}



export default AddProfile