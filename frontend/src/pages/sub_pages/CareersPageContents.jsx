import axios from "axios";
import { useEffect } from "react";
import UploadCard from "../../components/UploadCard";
import { useNavigate } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

function CareersPageContents() {
    
const navigate = useNavigate();

  // const navigate = useNavigate()
  const fetchUser = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/careerspagecontents`, {
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
          <h1 className="text-blue-800 font-semibold text-xl">Careers Page Banner</h1>
          <UploadCard
            label="Carousel Image"
            uploadUrl={`${import.meta.env.VITE_API_BASE_URL}/fileUpload/upload/image`}
            acceptedTypes="image/png,image/webp"
            maxSizeMB={1}
            customFileName="careersPgBanner.webp"
            customDirectory="media/careersPage"
            onUploadSuccess={(data) => console.log("Uploaded!", data)}
          />
        </div>

      </div>
    </div>
  );
}

export default CareersPageContents;
