import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductDescription from "../../../components/ProductDescription";
import FileTable from "../../../components/FileTable";
import UploadCard from "../../../components/UploadCard";

function GoldLoanPageContents() {

  const table_name = "gold_loan";

  const navigate = useNavigate()
  const fetchUser = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/goldloanpagecontents`, {
        withCredentials: true,
      })
    } catch(err){
      navigate('/login')
      console.log(err)
    }
  }

useEffect(() => {
  fetchUser();
}, []);

  return (
    <div className="flex justify-center py-20">
      <div className="flex flex-col gap-10 w-full px-28">
        
        <div className="flex flex-col gap-3 w-full py-10">
          <h1 className="text-blue-800 font-semibold text-xl">Gold Loan Page Banner</h1>
          <UploadCard
            label="Carousel Image"
            uploadUrl={`${import.meta.env.VITE_API_BASE_URL}/fileUpload/upload/image`}
            acceptedTypes="image/png,image/webp"
            maxSizeMB={1}
            customFileName="gloanPgBanner.webp"
            customDirectory="media/products"
            onUploadSuccess={(data) => console.log("Uploaded!", data)}
          />
        </div>
        
        <div>
          <ProductDescription table_name={table_name} tokenUrl={`${import.meta.env.VITE_API_BASE_URL}/auth/goldloanpagecontents`}/>
          <FileTable fileDirectory="products/goldLoan/kfd" category="Key Fact Documents"/>
          <FileTable fileDirectory="products/goldLoan/tariff" category="Charges and Tariff"/>
          <FileTable fileDirectory="products/goldLoan/terms" category="Terms and Conditions"/>
        </div>

      </div>
    </div>
  );
}

export default GoldLoanPageContents;
