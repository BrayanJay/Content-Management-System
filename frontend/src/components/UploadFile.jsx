import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function UploadFile() {
    
  const [files, setFiles] = useState({});

  const handleFile = (e, num) => {
    setFiles({ ...files, [num]: e.target.files[0] });
  };

  const handleUpload = async (num) => {
    if (!files[num]) {
    alert(`No file selected for Slide 0${num}`);
    return;
  }

  const formData = new FormData();
  formData.append("file", files[num]); // Must match `upload.single("file")`
  formData.append("filename", `carousel_slide0${num}.jpg`);
  formData.append("file_directory", "media/landing_page_carousel");

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/data/upload`, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert(response.data.message);
    window.location.reload();
  } catch (err) {
    alert(`Upload failed: ${err.response?.data?.message || err.message}`);
  }
  };

  const handleClear = (num) => {
    setFiles({ ...files, [num]: null });
    document.getElementById(`slide${num}`).value = ""; // Reset input field
  };

  const navigate = useNavigate()
  const fetchUser = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/landingpagecontents`, {
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
        <form>
          <label className="text-blue-800 font-medium">Landing Page Carousel</label>
          <table className="w-full border border-blue-300 shadow-lg border-separate">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="border border-blue-300 px-4 py-3 text-left">Slide</th>
                <th className="border border-blue-300 px-4 py-3 text-left">File</th>
                <th className="border border-blue-300 px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((num) => (
                <tr key={num} className="odd:bg-blue-100 even:bg-blue-50 transition duration-200">
                  <td className="border border-blue-300 px-4 py-1 font-medium text-slate-800">Slide 0{num}</td>
                  <td className="border border-blue-300 px-4 py-1">
                    <input
                      id={`slide${num}`}
                      type="file"
                      onChange={(e) => handleFile(e, num)}
                      className="file:border file:border-blue-300 file:bg-blue-50 file:text-blue-700 file:px-2 file:py-1 file:rounded-md file:cursor-pointer"
                    />
                  </td>
                  <td className="flex justify-center border border-blue-300 px-4 py-1.5 space-x-2">
                    <button
                      type="button"
                      className="bg-green-800 hover:bg-green-900 text-white font-semibold px-4 py-1 rounded-md transition duration-200"
                      onClick={() => handleUpload(num)}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-1 rounded-md transition duration-200"
                      onClick={() => handleClear(num)}
                    >
                      Clear
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
}

export default UploadFile;
