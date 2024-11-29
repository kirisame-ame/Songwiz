import React, { useState } from 'react'
import SearchIcon from '@/svg/SearchIcon'

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
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-[400px] max-w-[400px] rounded-md object-cover"
                    />
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
            <div
                className={`flex w-full items-center justify-center pt-2 ${previewUrl ? '' : 'hidden'}`}
            >
                <button className="border-1 flex items-center rounded-md bg-white px-5 text-3xl text-black transition duration-200 hover:scale-150">
                    <SearchIcon />
                    <p>Search</p>
                </button>
            </div>
        </div>
    )
}

// Style for the custom button

export default CustomFileInput
