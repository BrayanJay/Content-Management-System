import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductDescription from "../../../components/ProductDescription";
import FileTable from "../../../components/FileTable";
import UploadCard from "../../../components/UploadCard";

function LuckewalletPageContents() {
    
  const table_name = "luckewallet";

  const navigate = useNavigate()
  const fetchUser = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/luckewalletpagecontents`, {
        withCredentials: true,
      })
    } catch(err){
      navigate('/login')
      console.log(err)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <div className="flex justify-center container py-20">
      <div className="w-full m-10 px-20">
        
        <div className="flex flex-col gap-3 w-full py-10">
          <h1 className="text-blue-800 font-semibold text-xl">Luckewallet Page Banner</h1>
          <UploadCard
            label="Carousel Image"
            uploadUrl={`${import.meta.env.VITE_API_BASE_URL}/fileUpload/upload/image`}
            acceptedTypes="image/png,image/webp"
            maxSizeMB={1}
            customFileName="luckewalletPgBanner.webp"
            customDirectory="media/products"
            onUploadSuccess={(data) => console.log("Uploaded!", data)}
          />
        </div>
        
        <div>
          <ProductDescription table_name={table_name} tokenUrl={`${import.meta.env.VITE_API_BASE_URL}/auth/luckewalletpagecontents`}/>
          <FileTable fileDirectory="products/luckewallet/kfd" category="Key Fact Documents"/>
          <FileTable fileDirectory="products/luckewallet/tutorials" category="Luckewallet Tutorials"/>
        </div>
        
      </div>
    </div>
  );
}

export default LuckewalletPageContents;
