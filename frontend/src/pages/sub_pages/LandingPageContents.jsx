import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import PopupToggle from "../../components/PopupToggle";
import UploadCard from "../../components/UploadCard";

function LandingPageContents() {

  const carousels = [1, 2, 3];

  const tokenUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/landingpagecontents`;

  const navigate = useNavigate()
  
  const fetchUser = async () => {
    try {
      const response = await axios.get(tokenUrl, {
        withCredentials: true  // ✅ Send cookies/session info
      })
      if(response.status !== 200) {
        navigate('/login')
      }
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
      <div className="flex flex-col gap-2 w-full m-10 px-20">

        <h1 className="text-blue-800 font-semibold text-xl">Carousel Media</h1>

        {carousels.map((index) => (
        <UploadCard
          key={index}
          label={`Carousel ${String(index).padStart(2, "0")}`}
          uploadUrl={`${import.meta.env.VITE_API_BASE_URL}/fileUpload/upload/image`}
          acceptedTypes="image/webp"
          maxSizeMB={2}
          customFileName={`bannerimg${index}.webp`}
          customDirectory="media/landingpage"
          onUploadSuccess={(data) => console.log(`Uploaded bannerimg${index}.webp!`, data)}
        />
        ))}

        <div className="flex flex-col gap-3 w-full py-10">
          <h1 className="text-blue-800 font-semibold text-xl">Popup Media</h1>
          {/* <PopupToggle tokenUrl={tokenUrl}/> */}
          <UploadCard
            label="Popup Image"
            uploadUrl={`${import.meta.env.VITE_API_BASE_URL}/fileUpload/upload/image`}
            acceptedTypes="image/png,image/webp"
            maxSizeMB={1}
            customFileName="popup.webp"
            customDirectory="media/uploads"
            onUploadSuccess={(data) => console.log("Uploaded!", data)}
          />
      </div>
      </div>
    </div>
  );
}

export default LandingPageContents;
