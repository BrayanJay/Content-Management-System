import axios from 'axios';
import { useEffect, useState } from 'react'
import PropTypes from 'prop-types';
import UpdatePopup from './UpdatePopup';
import RemovePopup from './RemovePopup';

const ProductDescription = ({table_name, tokenUrl}) => {

    const [data, setData] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isRemovePopupOpen, setIsRemovePopupOpen] = useState(false); 
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/product/read/${table_name}`);
            setData(Array.isArray(res.data) ? res.data : []);
          } catch (err) {
            console.log("Error fetching data:", err.message);
          }
        };
      
        fetchData();
      }, [table_name]);

      

  const handleUpdateClick = (item) => {
    setSelectedItem(item); // Store the selected row's data
    setIsPopupOpen(true);  // Show the popup
  };

  const handleRemoveClick = (item) => {
    setSelectedItem(item);
    setIsRemovePopupOpen(true);
  };

  return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Description</h2>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                                <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                                <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                                <th className="px-4 py-3 border-b text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.length > 0 ? (
                              data.map( (product, index) => (
                                <tr className="hover:bg-gray-50" key={index}>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Description</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{product.lang}</td>
                                    <td className="px-4 py-4 text-sm text-gray-900 max-w-md truncate">{product.description}</td>
                                    <td className="px-4 py-4 text-center">
                                      <button className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 rounded mr-2 transition-colors text-sm" 
                                        onClick={() => handleUpdateClick(product)}>
                                        Update
                                      </button>
                                      <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors text-sm"
                                        onClick={() => handleRemoveClick(product)}>
                                        Remove
                                      </button>
                                    </td>
                                </tr>
                                ))
                              ) : (
                                <tr>
                                        <td colSpan="4" className="px-4 py-12 text-center text-gray-500">
                                          No data available
                                        </td>
                                      </tr>
                              )}
                        </tbody>
                </table>
            </div>

            {/* Render Popup only when isPopupOpen is true */}
      {isPopupOpen && selectedItem && (
        <UpdatePopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          initialLang={selectedItem.lang}
          initialDescription={selectedItem.description}
          table_name={table_name}// Set dynamically if needed
          tokenUrl={tokenUrl}
          updateData={(updatedItem) => {
            setData((prevData) =>
              prevData.map((item) =>
                item.lang === updatedItem.lang ? { ...item, description: updatedItem.description } : item
              )
            );
          }}
        />
      )}

      {isRemovePopupOpen && selectedItem && (
        <RemovePopup
          isOpen={isRemovePopupOpen}
          onClose={() => setIsRemovePopupOpen(false)}
          initialLang={selectedItem.lang}
          table_name={table_name} // Set dynamically if needed
        />
      )}

        </div>
  )
}
ProductDescription.propTypes = {
  table_name: PropTypes.string.isRequired,
  tokenUrl: PropTypes.string.isRequired,
};

export default ProductDescription