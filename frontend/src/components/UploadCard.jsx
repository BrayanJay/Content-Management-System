import { useState } from "react";
import PropTypes from "prop-types";
import { Upload, X, CheckCircle, AlertCircle, File, Image } from "lucide-react";

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
  const [isDragOver, setIsDragOver] = useState(false);

  const handleChange = (e) => {
    const selected = e.target.files[0];
    processFile(selected);
  };

  const processFile = (selected) => {
    if (selected && selected.size <= maxSizeMB * 1024 * 1024) {
      setFile(selected);
      setStatus(null);
    } else {
      setStatus(`File exceeds ${maxSizeMB} MB limit`);
      setFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const getFileIcon = () => {
    if (!file) return Upload;
    return file.type.startsWith('image/') ? Image : File;
  };

  const getStatusIcon = () => {
    if (!status) return null;
    return status.includes('successful') ? CheckCircle : AlertCircle;
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
    if (fileInput) fileInput.value = "";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const FileIcon = getFileIcon();
  const StatusIcon = getStatusIcon();

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{label}</h3>
        <p className="text-sm text-gray-500">
          Maximum file size: {maxSizeMB} MB • Accepted: {acceptedTypes}
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : file 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Upload Content */}
        <div className="text-center">
          {!file ? (
            <>
              {/* Upload Icon */}
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </div>
              
              {/* Upload Text */}
              <div className="mb-6">
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drop your file here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Drag and drop your file or click the button below
                </p>
              </div>
            </>
          ) : (
            <>
              {/* File Preview */}
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <FileIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              
              {/* File Details */}
              <div className="mb-6">
                <p className="text-lg font-medium text-gray-800 mb-1">{file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              
              {/* Clear Button */}
              <button
                onClick={handleClear}
                className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          )}

          {/* File Input */}
          <input
            type="file"
            accept={acceptedTypes}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <div className={`
          mt-4 p-3 rounded-lg flex items-center gap-2
          ${status.includes('successful') 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
          }
        `}>
          {StatusIcon && <StatusIcon className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-medium">{status}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        {!file ? (
          <label className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 cursor-pointer text-center transform hover:scale-105 active:scale-95">
            <span className="flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" />
              Choose File
            </span>
            <input
              type="file"
              accept={acceptedTypes}
              onChange={handleChange}
              className="hidden"
              disabled={loading}
            />
          </label>
        ) : (
          <>
            <button
              onClick={handleUpload}
              disabled={loading}
              className={`
                flex-1 font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95
                ${loading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                }
              `}
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    {buttonText}
                  </>
                )}
              </span>
            </button>
            
            <button
              onClick={handleClear}
              disabled={loading}
              className="sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400"
            >
              <span className="flex items-center justify-center gap-2">
                <X className="w-5 h-5" />
                Remove
              </span>
            </button>
          </>
        )}
      </div>
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
