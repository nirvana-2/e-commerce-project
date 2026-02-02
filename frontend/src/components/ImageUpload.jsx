import React, { useState } from "react";
import axios from "axios";

const ImageUpload = ({ onUploadSuccess }) => {
    const [loading, setLoading] = useState(false);

    const uploadImage = async (e) => {
        const files = e.target.files;
        const formData = new FormData();
        formData.append("file", files[0]);
        formData.append("upload_preset", "tiijrrtl"); // Put your preset name here

        setLoading(true);
        try {
            const res = await axios.post(
                "https://api.cloudinary.com/v1_1/djchpxz6w/image/upload", // Put your cloud name here
                formData
            );
            const imageUrl = res.data.secure_url;
            onUploadSuccess(imageUrl); // Send the URL back to the main form
            setLoading(false);
        } catch (err) {
            console.error("Upload error", err);
            setLoading(false);
            alert("Upload failed!");
        }
    };

    return (
        <div className="mb-4">
            <label className="block text-gray-700 mb-2">Product Image</label>
            <input
                type="file"
                onChange={uploadImage}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {loading && <p className="text-blue-500 mt-2 italic">Uploading to Cloudinary...</p>}
        </div>
    );
};

export default ImageUpload;