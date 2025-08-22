import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductDescription from "../../../components/ProductDescription";
import FileTable from "../../../components/FileTable";
import UploadCard from "../../../components/UploadCard";

function MortgagePageContents() {
    
  const table_name = "mortgage";
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/mortgagepagecontents`, {
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
    <div className="p-4 md:p-6 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Mortgage Page Management</h1>
          
          {/* Banner Upload Section */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Page Banner</h2>
            <UploadCard
              label="Carousel Image"
              uploadUrl={`${import.meta.env.VITE_API_BASE_URL}/fileUpload/upload/image`}
              acceptedTypes="image/png,image/webp"
              maxSizeMB={1}
              customFileName="mortgagePgBanner.webp"
              customDirectory="media/products"
              onUploadSuccess={(data) => console.log("Uploaded!", data)}
            />
          </div>

          {/* Product Description Section */}
          <div className="mb-8">
            <ProductDescription 
              table_name={table_name} 
              tokenUrl={`${import.meta.env.VITE_API_BASE_URL}/auth/mortgagepagecontents`}
            />
          </div>

          {/* File Tables Section */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Fact Documents</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <FileTable fileDirectory="products/mortgage/kfd" category="Key Fact Documents"/>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Charges and Tariff</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <FileTable fileDirectory="products/mortgage/tariff" category="Charges and Tariff"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MortgagePageContents;
