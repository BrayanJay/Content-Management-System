import axios from "axios";
import { Trash2 } from "lucide-react";
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


const Test = () => {
  const [data, setData] = useState([]);
  const [selectedLang, setSelectedLang] = useState("en");

  //New Profile Values
  const [nameEn, setNameEn] = useState("");
  const [nameSi, setNameSi] = useState("");
  const [nameTa, setNameTa] = useState("");
  const [designationEn, setDesignationEn] = useState("");
  const [designationSi, setDesignationSi] = useState("");
  const [designationTa, setDesignationTa] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionSi, setDescriptionSi] = useState("");
  const [descriptionTa, setDescriptionTa] = useState("");

  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const tokenUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/aboutpagecontents`;
  const navigate = useNavigate();

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

  useEffect(() => {
        const fetchData = async () => {
          try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/profile/test/profiles`);
            const updatedData = res.data.map(profile => ({
              ...profile,
              description: JSON.parse(profile.description || "[]"), // ✅ Parse JSON description
            }));
            setData(Array.isArray(updatedData) ? updatedData : []);
          } catch (err) {
            console.log("Error fetching data:", err.message);
          }
        };
      
        fetchData();
        fetchUser();
      }, []);

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

  //Add new profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nameEn || !nameSi || !nameTa || !designationEn || !designationSi || !designationTa || !descriptionEn || !descriptionSi || !descriptionTa) {
      setError("All fields in all languages are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Add branch details (returns branch_id)
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/profile/test/addProfile`, 
        { 
          branch_details: [
            { lang: "en", name_en: nameEn, designation_en: designationEn, description_en: descriptionEn },
            { lang: "si", name_si: nameSi, designation_si: designationSi, description_si: descriptionSi },
            { lang: "ta", name_ta: nameTa, designation_ta: designationTa, description_ta: descriptionTa }
          ]
        }, 
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      setNameEn(""); setNameSi(""); setNameTa("");
      setDesignationEn(""); setDesignationSi(""); setDesignationTa("");
      setDescriptionEn(""); setDescriptionSi(""); setDescriptionTa("");

      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => window.location.reload(), 500);

    } catch (err) {
      console.error("Error adding branch:", err);
      //setError(err.response?.data?.message || "Failed to add branch");
      alert(err.response?.data?.message || "Failed to add profile");
    } finally {
      //setLoading(false);
    }
  };

const handleReset = async (e) => {
  e.preventDefault();
  setNameEn("");
  setNameSi("");
  setNameTa("");
  setDesignationEn("");
  setDesignationSi("");
  setDesignationTa("");
  setDescriptionEn("");
  setDescriptionSi("");
  setDescriptionTa("");
  //setError("");
}

  return (

    <div className="flex flex-col">
      
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
                        {data.length > 0 ? (
                          data.map( (profile, index) => (
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
                                  <div className='flex flex-col gap-y-5 max-h-32 max-w-auto overflow-y-auto'>
                                  {selectedLang === 'en' ? profile.description_en.map((desc, i) => (
                                    <div key={i} className="flex items-center">
                                      <span>{desc}</span>
                                    </div>
                                  )) : selectedLang === 'si' ? profile.description_si.map((desc, i) => (
                                    <div key={i} className="flex items-center">
                                      <span>{desc}</span>
                                    </div>
                                  )) : profile.description_ta.map((desc, i) => (
                                    <div key={i} className="flex items-center">
                                      <span>{desc}</span>
                                    </div>
                                  ))}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center min-w-36">
                                  <div className='flex flex-row justify-center items-center'>
                                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2" 
                                     onClick={() => setIsPopupOpen(true)}
                                      >
                                      Edit
                                    </button>
                                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                                      > 
                                      <Trash2/>
                                    </button>
                                  </div>
                                </td>
                            </tr>
                            
                            ))
                          ) : (
                            <tr>
                                    <td colSpan="3" className="text-center border border-gray-300 px-4 py-2 text-gray-500">
                                      No data available
                                    </td>
                                  </tr>
                          )}
                    </tbody>
            </table>

      {/* Add New Profile Form */}
      <div className="w-full max-w-screen-lg p-4 bg-white border-blue-600 border hover:shadow-lg transition-all ease-in-out duration-300 rounded-lg shadow-sm sm:p-6">
        <h1 className="text-lg font-bold text-blue-600 underline pb-1">Add New Profile</h1>
        {error && <p className="text-red-500">{error}</p>}
  
        <form onSubmit={handleSubmit}>
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

          <div className="mb-4">
            <label className="block text-slate-700">Description (EN)</label>
            <input
              type="text"
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
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
            <input
              type="text"
              value={descriptionSi}
              onChange={(e) => setDescriptionSi(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
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
            <input
              type="text"
              value={descriptionTa}
              onChange={(e) => setDescriptionTa(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          <div className="flex justify-end gap-2.5">
            
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>

            <button
              type="reset"
              onClick={handleReset}
              className="px-4 py-2 hover:border-blue-800 border-2 border-blue-600 text-blue-600 hover:text-blue-800 rounded-md"
            >
              Reset
            </button>

          </div>
          </form>

      </div>
    </div>
  )
}

export default Test
