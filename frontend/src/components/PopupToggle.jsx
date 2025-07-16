import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

function PopupToggle({ tokenUrl }) {
  const [popupEnabled, setPopupEnabled] = useState(false);
  const [pendingValue, setPendingValue] = useState(false);
  const navigate = useNavigate();

  // Fetch popup state on load
  useEffect(() => {
    const fetchPopupState = async () => {
      try {
        const response = await axios.get("http://localhost:3000/popup/popup-state", { withCredentials: true });
        setPopupEnabled(response.data.popupEnabled);
        setPendingValue(response.data.popupEnabled);
      } catch (error) {
        console.error("Error fetching popup state:", error);
      }
    };

    fetchPopupState();
  }, []);

  // Check user token on load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        await axios.get(tokenUrl, { withCredentials: true });
      } catch (err) {
        navigate('/login');
        console.log(err);
      }
    };

    fetchUser();
  }, [navigate, tokenUrl]);

  // Handle toggle switch
  const handleToggle = () => {
    setPendingValue(!pendingValue);
  };

  // Save button: send to backend and update state without reloading
  const handleSave = async () => {
    try {
      await axios.post("http://localhost:3000/popup/popup-state",
        { enabled: pendingValue },
        { withCredentials: true }
      );
      setPopupEnabled(pendingValue); // update the displayed state
      alert("Popup state saved successfully!"); // optional
    } catch (error) {
      console.error("Error updating popup state:", error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-blue-800 font-semibold text-xl">Popup Feature</label>
      <div className='flex flex-row'>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={pendingValue}
            onChange={handleToggle}
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
          <span className="pl-2">{pendingValue ? "Enabled" : "Disabled"}</span>
        </label>
        <button
          className='ml-5 max-w-24 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2'
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}

PopupToggle.propTypes = {
  tokenUrl: PropTypes.string.isRequired,
};

export default PopupToggle;
