import { useState } from "react";
import PropTypes from "prop-types";

const UploadCard = ({
  label = "Upload File",
  uploadUrl = "/upload/document",
  acceptedTypes = "*/*",
  maxSizeMB = 5,
  customFileName,
  customDirectory,
  onUploadSuccess,
  onUploadError,
  buttonText = "Upload",
}) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.size <= maxSizeMB * 1024 * 1024) {
      setFile(selected);
      setStatus(null);
    } else {
      setStatus(`File exceeds ${maxSizeMB} MB limit`);
      setFile(null);
    }
  };

  const getDefaultDirectory = (mimeType) => {
    if (mimeType.startsWith("image/")) return "media/image";
    return "media/document";
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    // Append custom or default filename
    const finalFilename = customFileName || file.name;
    formData.append("filename", finalFilename);

    // Append custom or type-based default directory
    const finalDirectory = customDirectory || getDefaultDirectory(file.type);
    formData.append("directory", finalDirectory);

    console.log('Upload details:', {
      filename: finalFilename,
      directory: finalDirectory,
      uploadUrl,
      fileType: file.type,
      fileSize: file.size
    });

    setLoading(true);
    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      console.log('Upload response:', { status: response.status, data });

      if (response.ok) {
        setStatus("Upload successful!");
        setFile(null); // Clear file after successful upload
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
        onUploadSuccess && onUploadSuccess(data);
      } else {
        const errorMessage = data.message || `Upload failed with status ${response.status}`;
        setStatus(errorMessage);
        console.error('Upload error:', data);
        onUploadError && onUploadError(data);
      }
    } catch (err) {
      const errorMessage = err.message || "Network or server error";
      setStatus(errorMessage);
      console.error('Network/Server error:', err);
      onUploadError && onUploadError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
        setFile(null);
        setStatus(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = ""; // Reset input field
    };

  return (
    <div className="flex flex-row items-center justify-between gap-2 p-4 border rounded-xl shadow bg-white w-full">
      <label className="font-semibold">{label}</label>
      <input
        type="file"
        accept={acceptedTypes}
        onChange={handleChange}
        className="file:border file:rounded file:px-2 file:bg-gray-100 file:text-sm"
      />
      {file && (
        <div className="flex flex-row gap-10">
        <p className="text-sm text-gray-500">Selected: {file.name}</p>
        <button className="text-red-500 hover:text-red-700" onClick={handleClear}>X</button>
        </div>
      )}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : buttonText}
      </button>
      
      {status && (
        <p className={`text-sm ${status.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </p>
      )}
    </div>
  );
};

UploadCard.propTypes = {
  label: PropTypes.string,
  uploadUrl: PropTypes.string,
  acceptedTypes: PropTypes.string,
  maxSizeMB: PropTypes.number,
  customFileName: PropTypes.string,
  customDirectory: PropTypes.string,
  onUploadSuccess: PropTypes.func,
  onUploadError: PropTypes.func,
  buttonText: PropTypes.string,
};

export default UploadCard;
