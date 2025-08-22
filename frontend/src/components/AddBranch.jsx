import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBuildingColumns } from "react-icons/fa6";
import { IoArrowBack, IoArrowForward, IoCheckmarkCircle } from "react-icons/io5";
import UploadCard from "./UploadCard";

const AddBranch = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Branch Details for all languages
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

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);

  const tokenUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/branchdetails`;
  const navigate = useNavigate();

  // Region options
  const regionOptions = useMemo(() => [
    { id: 'HEAD_OFFICE', name: 'Head Office' },
    { id: 'WESTERN_REGION', name: 'Western Region' },
    { id: 'SOUTHERN_REGION', name: 'Southern Region' },
    { id: 'EASTERN_REGION', name: 'Eastern Region' },
    { id: 'NORTHERN_REGION', name: 'Northern Region' },
    { id: 'CENTRAL_REGION', name: 'Central Region' },
    { id: 'NORTH-WESTERN_REGION', name: 'North-Western Region' },
    { id: 'UVA_REGION', name: 'Uva Region' },
    { id: 'SABARAGAMUWA_REGION', name: 'Sabaragamuwa Region' },
  ], []);

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

  // Add new branch
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for step 1
    if (currentStep === 1) {
      if (!branchNameEn || !branchNameSi || !branchNameTa || 
          !branchAddressEn || !branchAddressSi || !branchAddressTa ||
          !regionNameEn || !regionNameSi || !regionNameTa ||
          !regionId || !contactNumber || !email || 
          !coordinatesLongitude || !coordinatesLatitude) {
        setError("All fields are required");
        return;
      }
      
      // Move to step 2
      setCurrentStep(2);
      setError("");
      return;
    }

    // Validation for step 2
    if (currentStep === 2) {
      // Move to step 3
      setCurrentStep(3);
      return;
    }

    // Final submission on step 3
    if (currentStep === 3) {
      setLoading(true);
      setError("");

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/branch/branches/add`,
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

        console.log("Branch created with ID:", response.data.id);
        alert("Branch added successfully!");
        navigate("/branch-network");

      } catch (err) {
        console.error("Submission failed:", err);
        setError(err.response?.data?.message || "Failed to add branch");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    setBranchNameEn("");
    setBranchNameSi("");
    setBranchNameTa("");
    setBranchAddressEn("");
    setBranchAddressSi("");
    setBranchAddressTa("");
    setRegionNameEn("");
    setRegionNameSi("");
    setRegionNameTa("");
    setRegionId("");
    setContactNumber("");
    setEmail("");
    setCoordinatesLongitude("");
    setCoordinatesLatitude("");
    setError("");
    setCurrentStep(1);
    setImageUploaded(false);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  // Auto-fill region names when region ID changes
  useEffect(() => {
    if (regionId) {
      const selectedRegion = regionOptions.find(r => r.id === regionId);
      if (selectedRegion) {
        setRegionNameEn(selectedRegion.name);
        setRegionNameSi(selectedRegion.name); // You can add Sinhala translations
        setRegionNameTa(selectedRegion.name); // You can add Tamil translations
      }
    }
  }, [regionId, regionOptions]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
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
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Branch Image</h3>
            <UploadCard
              label="Branch Image"
              uploadUrl={`${import.meta.env.VITE_API_BASE_URL}/fileUpload/upload/image`}
              acceptedTypes="image/png,image/webp"
              maxSizeMB={1}
              customFileName={`${branchNameEn.toLowerCase().replace(/\s+/g, '').replace(/_+/g, '')}.webp`}
              customDirectory="media/branches"
              onUploadSuccess={(data) => {
                console.log("Uploaded!", data);
                setImageUploaded(true);
              }}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Review & Confirm</h3>
            
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Region</p>
                  <p className="text-gray-900">{regionOptions.find(r => r.id === regionId)?.name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Branch Name (EN)</p>
                  <p className="text-gray-900">{branchNameEn}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Contact Number</p>
                  <p className="text-gray-900">{contactNumber}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">{email}</p>
                </div>
                
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-600">Address (EN)</p>
                  <p className="text-gray-900">{branchAddressEn}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Coordinates</p>
                  <p className="text-gray-900">{coordinatesLatitude}, {coordinatesLongitude}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Image Upload</p>
                  <p className="text-gray-900">{imageUploaded ? "✅ Uploaded" : "❌ Not uploaded"}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Please review all information carefully. Once confirmed, the branch will be added to the system.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-6 pt-20 md:pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FaBuildingColumns className="text-blue-600 text-2xl" />
            <h1 className="text-2xl font-bold text-gray-800">Add New Branch</h1>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep >= step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step ? <IoCheckmarkCircle className="text-white" /> : step}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? "text-blue-600" : "text-gray-500"
                }`}>
                  {step === 1 && "Details"}
                  {step === 2 && "Upload"}
                  {step === 3 && "Confirm"}
                </span>
                {step < 3 && (
                  <div className={`w-16 h-0.5 ml-4 ${
                    currentStep > step ? "bg-blue-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <IoArrowBack />
                    Back
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Reset
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/branch-network")}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className={`flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    "Adding..."
                  ) : currentStep === 3 ? (
                    "Add Branch"
                  ) : (
                    <>
                      Next
                      <IoArrowForward />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBranch;
