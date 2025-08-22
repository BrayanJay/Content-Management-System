import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FileTable from "../components/FileTable";


const Documents = () => {
    const tokenUrl = `${import.meta.env.VITE_API_BASE_URL }/auth/documents`;
    const navigate = useNavigate();

  useEffect(() => {
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

    fetchUser();
  }, [navigate, tokenUrl]);

  return (
    <div className="p-4 md:p-6 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-blue-900 mb-5">Documents</h1>
      <div>
        <FileTable fileDirectory="annualReports" category="Annual Reports"/>
      </div>
        <div>
          <FileTable fileDirectory="customerInformation" category="Customer Information"/>
        </div>
        <div>
          <FileTable fileDirectory="interiemFinancials" category="Interiem Financials"/>
        </div>
        <div>
          <FileTable fileDirectory="otherRelatedDocs" category="Other Related Documents"/>
        </div>
        <div>
          <FileTable fileDirectory="promotions" category="Promotions Page"/>
        </div>
      </div>
    </div>
  )
}

export default Documents