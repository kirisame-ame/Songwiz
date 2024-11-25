import React, { useState } from 'react';

function CustomFileInput() {
    const [fileName, setFileName] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');

    // Handle file change
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name); // Update the file name display
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            }
            else{
                setPreviewUrl('null');
            }
        }
    };

    // Trigger file input click when custom button is clicked
    const handleButtonClick = () => {
        document.getElementById('hidden-file-input').click();
    };

    return (
        <div className="">
            {previewUrl &&
                <div className="flex justify-center items-center">
                    <img src={previewUrl} alt="Preview" className="w-sm"/>
                </div>
            }
            {/* Hidden file input */}
            <input
                id="hidden-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }} // Hide the default file input
            />
            {/* Display selected file name */}
            {fileName && <p>Selected File: {fileName}</p>}
            {/* Custom button to trigger file input */}
            <button onClick={handleButtonClick}
                    className="text-3xl px-5 border-1 rounded-md text-black/70 hover:scale-150 transition duration-200 "

            >
                Upload File
            </button>
        </div>
    );
}

// Style for the custom button

export default CustomFileInput;
