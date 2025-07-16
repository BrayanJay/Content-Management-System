import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { BiChevronDown } from "react-icons/bi";
import { FaBuildingColumns, FaChartArea, FaLocationDot } from "react-icons/fa6";
import { IoCall } from "react-icons/io5";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { CiMap, CiSearch } from "react-icons/ci";
import UpdateBranchPopup from "../components/UpdateBranchPopup";
import { useNavigate } from "react-router-dom";

const BranchNetwork = () => {
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchDetails, setBranchDetails] = useState(null);
  const [selectedLang, setSelectedLang] = useState("en");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  //const [isRemovePopupOpen, setIsRemovePopupOpen] = useState(false);

  //New Branch Values
  const [branchNameEn, setBranchNameEn] = useState("");
  const [branchNameSi, setBranchNameSi] = useState("");
  const [branchNameTa, setBranchNameTa] = useState("");
  const [regionEn, setRegionEn] = useState("");
  const [regionSi, setRegionSi] = useState("");
  const [regionTa, setRegionTa] = useState("");
  const [addressEn, setAddressEn] = useState("");
  const [addressSi, setAddressSi] = useState("");
  const [addressTa, setAddressTa] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [contact, setContact] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tokenUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/branchdetails`;
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
    const fetchBranches = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/branch/branches/getBranchDetails/en`
        );
        setBranches(response.data);
        setFilteredBranches(response.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
    fetchUser();
  }, []);

  // Fetch branch details when branch or language changes
  useEffect(() => {
    const fetchBranchDetails = async () => {
      if (selectedBranch) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/branch/branches/getBranchById/${selectedBranch.branch_id}/${selectedLang}`
          );
          setBranchDetails(response.data);
        } catch (error) {
          console.error("Error fetching branch details:", error);
          setBranchDetails(null);
        }
      }
    };

    fetchBranchDetails();
  }, [selectedLang, selectedBranch]);

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

  //New Branch
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!branchNameEn || !branchNameSi || !branchNameTa || !regionEn || !regionSi || !regionTa || !addressEn || !addressSi || !addressTa || !longitude || !latitude || !contact) {
      setError("All fields in all languages, coordinates, and contact are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Add branch details (returns branch_id)
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/branch/addBranch`, 
        { 
          branch_details: [
            { lang: "en", branch_name: branchNameEn, region: regionEn, address: addressEn },
            { lang: "si", branch_name: branchNameSi, region: regionSi, address: addressSi },
            { lang: "ta", branch_name: branchNameTa, region: regionTa, address: addressTa }
          ]
        }, 
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      const branch_id = res.data.branch_id;

      // 2. Add coordinates
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/branch/addBranchCoordinates`, 
        { branch_id, longitude, latitude },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      // 3. Add contact
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/branch/addBranchContact`, 
        { branch_id, contact_number: contact },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      setBranchNameEn(""); setBranchNameSi(""); setBranchNameTa("");
      setRegionEn(""); setRegionSi(""); setRegionTa("");
      setAddressEn(""); setAddressSi(""); setAddressTa("");
      setLongitude(""); setLatitude(""); setContact("");

      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => window.location.reload(), 500);

    } catch (err) {
      console.error("Error adding branch:", err);
      setError(err.response?.data?.message || "Failed to add branch");
    } finally {
      setLoading(false);
    }
  };

const handleReset = async (e) => {
  e.preventDefault();
  setBranchNameEn("");
  setBranchNameSi("");
  setBranchNameTa("");
  setRegionEn("");
  setRegionSi("");
  setRegionTa("");
  setAddressEn("");
  setAddressSi("");
  setAddressTa("");
  setError("");
}
  

  return (
    <div className="py-20 px-40">
      <h1 className="text-xl font-bold text-blue-900 mb-5">Branch Network</h1>
      <div className="pb-10 grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-2 pr-20">

        {/* Branch Selection Dropdown */}
        <div className="relative w-full max-w-md" ref={dropdownRef}>
          <div
            className="w-full px-3 py-2 border rounded-md bg-white cursor-pointer justify-between flex items-center"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {selectedBranch?.branch_name || "Select Branch"}{" "}
            <BiChevronDown className="float-right" />
          </div>

          {dropdownOpen && (
            <div className="absolute flex flex-col w-full border rounded-md bg-white shadow-lg mt-1 z-10">
              <div className="flex flex-row border-b focus:outline-none items-center">
              <span className="px-2"><CiSearch /></span>
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search Branch"
                className="w-full py-2 "
              />
              </div>
              <ul className="max-h-40 overflow-y-auto">
                {filteredBranches.length > 0 ? (
                  filteredBranches.map((branch) => (
                    <li
                      key={branch.branch_id}
                      onClick={() => handleSelectBranch(branch)}
                      className="px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-blue-200 cursor-pointer"
                    >
                      {branch.branch_name}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-gray-500">No branches found</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Language Selection */}
        <div className="relative w-full max-w-md">
          <select
            className="w-full px-3 py-2 border rounded-md bg-white cursor-pointer justify-between flex items-center"
            onChange={(e) => setSelectedLang(e.target.value)}
            value={selectedLang}
          >
            <option value="">Select Language</option>
            <option value="en">English</option>
            <option value="si">Sinhala</option>
            <option value="ta">Tamil</option>
          </select>
        </div>
      </div>

      {/* Display Selected Branch Details */}
      {branchDetails && (
        <div className="mb-10 w-full max-w-screen-lg p-4 bg-white border-blue-600 border hover:shadow-lg transition-all ease-in-out duration-300 rounded-lg shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-blue-600 underline pb-1">
            Branch Details
          </h2>

          <div className="flex flex-col gap-1">
            {/* Branch ID */}
          <div className="flex-row gap-2 text-base text-slate-500 items-center hidden">
            <FaBuildingColumns />
            <p className="font-semibold">Branch ID: </p>
            <span>{branchDetails.branch_id}</span>
          </div>
          {/* Branch Name */}
          <div className="flex flex-row gap-2 text-base text-slate-500 items-center">
            <MdDriveFileRenameOutline />
            <p className="font-semibold">Name: </p>
            <span>{branchDetails.branch_name}</span>
          </div>
          {/* Region */}
          <div className="flex flex-row gap-2 text-base text-slate-500 items-center">
            <FaChartArea />
            <p className="font-semibold">Region: </p>
            <span>
              {branchDetails.region
                ? branchDetails.region.charAt(0).toUpperCase() +
                  branchDetails.region.slice(1)
                : ""}
            </span>
          </div>
          {/* Location */}
          <div className="flex flex-row gap-2 text-base text-slate-500 items-center">
            <FaLocationDot />
            <p className="font-semibold">Address: </p>
            <span>{branchDetails.address}</span>
          </div>
          </div>
          {/* Longitude & Latitude */}
          <div className="flex flex-row gap-2 text-base text-slate-500 items-center">
            <div className="flex flex-row items-center gap-2">
            <CiMap />
            <p className="font-semibold">Latitude: </p>
            <span>{branchDetails.latitude}</span>
            </div>
            <div className="flex flex-row items-center gap-2">
            <CiMap />
            <p className="font-semibold">Longitude: </p>
            <span>{branchDetails.longitude}</span>
            </div>
          </div>
          {/* Contacts */}
          <div className="flex flex-row gap-2 text-base text-slate-500 items-center">
            <IoCall />
            <p className="font-semibold">Contact: </p>
            <span>{branchDetails.contact_number}</span>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-row items-center gap-2 pt-2">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-md transition duration-200"
              onClick={() => setIsPopupOpen(true)}
            >
              Edit
            </button>
            <button
              className=" hover:border-blue-800 border-2 border-blue-600 text-blue-600 hover:text-blue-800 font-semibold py-1.5 px-2 rounded-md transition duration-200"
              //onClick={() => setIsRemovePopupOpen(true)}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-screen-lg p-4 bg-white border-blue-600 border hover:shadow-lg transition-all ease-in-out duration-300 rounded-lg shadow-sm sm:p-6">
        <h1 className="text-lg font-bold text-blue-600 underline pb-1">Add New Branch</h1>
        {error && <p className="text-red-500">{error}</p>}
  
        <form onSubmit={handleSubmit}>
        <h2 className="text-base font-semibold text-blue-800 pb-1">In English</h2>
          
          <div className="mb-4">
            <label className="block text-slate-700">Branch Name (EN)</label>
            <input
              type="text"
              value={branchNameEn}
              onChange={(e) => setBranchNameEn(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-slate-700">Region (EN)</label>
            <input
              type="text"
              value={regionEn}
              onChange={(e) => setRegionEn(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-slate-700">Address (EN)</label>
            <input
              type="text"
              value={addressEn}
              onChange={(e) => setAddressEn(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          <h2 className="text-base font-semibold text-blue-800 pb-1">In Sinhala</h2>

          <div className="mb-4">
            <label className="block text-slate-700">Branch Name (SI)</label>
            <input
              type="text"
              value={branchNameSi}
              onChange={(e) => setBranchNameSi(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-slate-700">Region (SI)</label>
            <input
              type="text"
              value={regionSi}
              onChange={(e) => setRegionSi(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-slate-700">Address (SI)</label>
            <input
              type="text"
              value={addressSi}
              onChange={(e) => setAddressSi(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          <h2 className="text-base font-semibold text-blue-800 pb-1">In Tamil</h2>

          <div className="mb-4">
            <label className="block text-slate-700">Branch Name (TA)</label>
            <input
              type="text"
              value={branchNameTa}
              onChange={(e) => setBranchNameTa(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-slate-700">Region (TA)</label>
            <input
              type="text"
              value={regionTa}
              onChange={(e) => setRegionTa(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-slate-700">Address (TA)</label>
            <input
              type="text"
              value={addressTa}
              onChange={(e) => setAddressTa(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          <h2 className="text-base font-semibold text-blue-800 pb-1">Longitude & Latitude</h2>

          <div className="mb-4">
            <label className="block text-slate-700">Longitude</label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-slate-700">Latitude</label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full p-2 border rounded-md text-sm border-blue-300  "
              required
            />
          </div>

          <h2 className="text-base font-semibold text-blue-800 pb-1">Contact Info</h2>

          <div className="mb-4">
            <label className="block text-slate-700">Contact No</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
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

      {isPopupOpen && selectedBranch && (
        <UpdateBranchPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          initialLang={selectedLang}
          initialBranchName={branchDetails.branch_name}
          initialRegion={branchDetails.region}
          initialAddress={branchDetails.address}
          initialLatitude={branchDetails.latitude}
          initialLongitude={branchDetails.longitude}
          initialContact={branchDetails.contact_number}
          id={selectedBranch.branch_id}
          tokenUrl={tokenUrl}
        />
      )}
    </div>
  );
};

export default BranchNetwork;
