// components/ImageUpload.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  AiOutlineCloudUpload,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";
import { MdCancel, MdCheckCircle } from "react-icons/md";
import { FiImage } from "react-icons/fi";

const ImageUpload = ({
  onImageUpload, // Callback function when image is uploaded successfully
  defaultImage = "", // Default image URL (for editing)
  folder = "news", // Cloudinary folder name
  className = "", // Additional CSS classes
  buttonText = "Upload Image", // Custom button text
  showPreview = true, // Show image preview
  maxSize = 5, // Max file size in MB
  acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"], // Accepted file types
  id = "image-upload", // Add this prop with a default value
}) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(defaultImage);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Cloudinary configuration
  const CLOUD_NAME = "dfrvozkwv"; // Your cloud name
  const UPLOAD_PRESET = "kaisa34"; // Your upload preset

  // Validate file
  const validateFile = (file) => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      toast.error(
        `File type not supported. Please upload: ${acceptedTypes.join(", ")}`,
      );
      return false;
    }

    // Check file size (convert to MB)
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      toast.error(`File size too large. Maximum size is ${maxSize}MB`);
      return false;
    }

    return true;
  };

  // Handle file upload
  const uploadToCloudinary = async (file) => {
    if (!validateFile(file)) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    // Optional: Add folder to organize uploads
    if (folder) {
      formData.append("folder", folder);
    }

    try {
      setUploading(true);
      setProgress(30); // Simulate progress start

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      setProgress(70); // Progress mid-point

      const data = await res.json();

      if (data.secure_url) {
        setProgress(100);
        setImageUrl(data.secure_url);

        // Call the callback with the image URL
        onImageUpload(data.secure_url);

        toast.success("Image uploaded successfully!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error(err.message || "Image upload failed. Please try again.");
      setProgress(0);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500); // Small delay to show 100% progress
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadToCloudinary(file);
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadToCloudinary(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageUrl("");
    onImageUpload(""); // Notify parent that image was removed
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden file input */}
      <input
        type="file"
        id={id} // Use the unique ID here
        className="hidden"
        accept={acceptedTypes.join(",")}
        onChange={handleFileChange}
        disabled={uploading}
      />

      {/* Upload Area */}
      {!imageUrl ? (
        <label
          htmlFor={id} // Reference the unique ID here
          className={`
            relative flex flex-col items-center justify-center w-full 
            border-2 border-dashed rounded-lg cursor-pointer
            transition-all duration-200
            ${
              dragActive
                ? "border-[#146C94] bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }
            ${uploading ? "pointer-events-none opacity-75" : ""}
            min-h-[200px] p-6
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            {uploading ? (
              <>
                <AiOutlineLoading3Quarters className="w-10 h-10 text-[#146C94] animate-spin" />
                <p className="text-sm text-gray-600">
                  Uploading... {progress}%
                </p>
                {progress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-xs">
                    <div
                      className="bg-[#146C94] h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </>
            ) : (
              <>
                <AiOutlineCloudUpload className="w-12 h-12 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  {acceptedTypes.map((type) => type.split("/")[1]).join(", ")}{" "}
                  (Max: {maxSize}MB)
                </p>
              </>
            )}
          </div>
        </label>
      ) : (
        /* Image Preview */
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          {showPreview && (
            <img
              src={imageUrl}
              alt="Uploaded preview"
              className="w-full h-48 object-contain"
            />
          )}

          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
            {/* Replace button */}
            <label
              htmlFor={id}
              className={`p-2 bg-white rounded-full cursor-pointer hover:bg-gray-100 transition-colors ${
                uploading ? "pointer-events-none opacity-50" : ""
              }`}
              title="Replace image"
            >
              <FiImage className="w-5 h-5 text-[#146C94]" />
            </label>

            {/* Remove button */}
            <button
              onClick={handleRemoveImage}
              disabled={uploading}
              className={`p-2 bg-white rounded-full hover:bg-gray-100 transition-colors ${
                uploading ? "pointer-events-none opacity-50" : ""
              }`}
              title="Remove image"
            >
              <MdCancel className="w-5 h-5 text-red-500" />
            </button>

            {/* Success indicator */}
            <div className="absolute top-2 right-2">
              <MdCheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>

          {/* Upload progress overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center">
              <AiOutlineLoading3Quarters className="w-8 h-8 text-[#146C94] animate-spin mb-2" />
              <p className="text-sm text-gray-600">
                Replacing image... {progress}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden upload button as fallback */}
      {!imageUrl && (
        <button
          onClick={() => document.getElementById(id)?.click()}
          disabled={uploading}
          className="mt-2 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
