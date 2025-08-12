import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UploadCard from "../../components/UploadCard";

function InvestorRelationsPageContents() {

  const navigate = useNavigate()
  const fetchUser = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/investorrelationspagecontents`, {
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
          <h1 className="text-blue-800 font-semibold text-xl">Inverstor Relations Page Banner</h1>
          <UploadCard
            label="Carousel Image"
            uploadUrl={`${import.meta.env.VITE_API_BASE_URL}/fileUpload/upload/image`}
            acceptedTypes="image/png,image/webp"
            maxSizeMB={1}
            customFileName="irPgBanner.webp"
            customDirectory="media/investorRelations"
            onUploadSuccess={(data) => console.log("Uploaded!", data)}
          />
        </div>

      </div>
    </div>
  );
}

export default InvestorRelationsPageContents;
