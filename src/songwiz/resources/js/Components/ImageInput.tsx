import React, { useState } from 'react'

function CustomFileInput() {
    const [fileName, setFileName] = useState('')
    const [previewUrl, setPreviewUrl] = useState('')

    // Handle file change
    const handleFileChange = (event: any) => {
        const file = event.target.files[0]
        if (file) {
            setFileName(file.name) // Update the file name display
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file)
                setPreviewUrl(url)
            } else {
                setPreviewUrl('null')
            }
        }
    }

    // Trigger file input click when custom button is clicked
    const handleButtonClick = () => {
        // @ts-ignore
        document.getElementById('hidden-file-input').click()
    }

    return (
        <div className="">
            {previewUrl && (
                <div className="flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="max-w-sm" />
                </div>
            )}
            {/* Hidden file input */}
            <input
                id="hidden-file-input"
                type="file"
                accept="image/jpeg, image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }} // Hide the default file input
            />
            {/* Display selected file name */}
            {fileName && <p>Selected File: {fileName}</p>}
            {/* Custom button to trigger file input */}
            <button
                onClick={handleButtonClick}
                className="border-1 rounded-md px-5 text-3xl text-black transition duration-200 hover:scale-150"
            >
                {previewUrl ? 'Change File' : 'Upload File'}
            </button>
        </div>
    )
}

// Style for the custom button

export default CustomFileInput
