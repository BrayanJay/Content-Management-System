import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UploadCard from "../../components/UploadCard";
import GetProfileDetails from "../../components/profiles/ProfileData";

function AboutPageContents() {

  const tokenUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/aboutpagecontents`

  const navigate = useNavigate()
  const fetchUser = async () => {
    try {
      await axios.get(tokenUrl, {
        withCredentials: true 
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
      <div className="flex flex-col gap-10 w-full m-10 px-20">
        <div>
          <UploadCard
            label={`Carousel`}
            uploadUrl={`${import.meta.env.VITE_API_BASE_URL}/fileUpload/upload/image`}
            acceptedTypes="image/webp"
            maxSizeMB={2}
            customFileName={`bannerAbout.webp`}
            customDirectory="media/landingpage"
            onUploadSuccess={(data) => console.log(`Uploaded bannerAbout.webp!`, data)}
          />
        </div>
        {/* <div className="">
          <label className="text-blue-800 font-semibold text-xl">Profile Details</label>
          {ids.length > 0 && 
            ids.map((id) => (
              <div key={id} className="pt-2.5">
                <label className="text-blue-600 font-semibold text-lg">Profile {id}</label>
                <ProfileData id={id} tokenUrl={tokenUrl}/>
              </div>
            ))
          }
        </div> */}
        <div>
          <GetProfileDetails/>
        </div>
      </div>
    </div>
  );
}

export default AboutPageContents;
