import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, Upload, FileText } from "lucide-react";
import ProductDescription from "../../../components/ProductDescription";
import FileTable from "../../../components/FileTable";
import UploadCard from "../../../components/UploadCard";

function FixedDepositsPageContents() {
    
//Carousel ----- API
  const table_name = "fixed_deposits";
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/fixeddepositspagecontents`, {
          withCredentials: true,
        })
      } catch(err){
        navigate('/login')
        console.log(err)
      }
    }

    fetchUser()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fixed Deposits Page Management</h1>
              <p className="text-gray-600">Manage content, banners, and documents for the fixed deposits product page</p>
            </div>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>

        {/* Banner Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Page Banner</h2>
                <p className="text-sm text-gray-600">Upload banner image for the fixed deposits product page</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="max-w-2xl">
              <UploadCard
                label="Fixed Deposits Banner Image"
                uploadUrl={`${import.meta.env.VITE_API_BASE_URL}/fileUpload/upload/image`}
                acceptedTypes="image/png,image/webp"
                maxSizeMB={1}
                customFileName="fdPgBanner.webp"
                customDirectory="media/products"
                onUploadSuccess={(data) => console.log("Uploaded!", data)}
              />
            </div>
            
            {/* Banner Guidelines */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Upload className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">Banner Guidelines</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Recommended resolution: 1920x600 pixels or 16:5 aspect ratio</li>
                    <li>• Supported formats: PNG or WebP</li>
                    <li>• Maximum file size: 1MB</li>
                    <li>• Use professional images related to savings and investments</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Product Description</h2>
                <p className="text-sm text-gray-600">Manage content and descriptions for fixed deposit products</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <ProductDescription 
              table_name={table_name} 
            />
          </div>
        </div>

        {/* Files & Documents Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Documents & Files</h2>
                <p className="text-sm text-gray-600">Manage downloadable files and documents for fixed deposit products</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <FileTable 
              fileDirectory='products/fixedDeposit/kfd' category="Key Fact Documents"
            />
          </div>
          <div className="p-6">
            <FileTable 
              fileDirectory='products/fixedDeposit/rates' category="FD Rates"
            />
          </div>
          <div className="p-6">
            <FileTable 
              fileDirectory='products/fixedDeposit/accounts' category="collection accounts"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FixedDepositsPageContents;
