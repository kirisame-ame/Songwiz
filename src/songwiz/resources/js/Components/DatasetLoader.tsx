import React, { useState } from 'react'
import axios from 'axios'

function DatasetLoader() {
    const [fileName, setFileName] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false) // Track upload status
    const [showModal, setShowModal] = useState(false) // Track modal visibility

    const handleLoadDataset = async () => {
        if (file) {
            setIsUploading(true) // Start the upload process
            setShowModal(true) // Show the modal

            const formData = new FormData()
            formData.append('file', file)

            axios
                .post('/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                .then((res) => {
                    console.log(res)
                    setIsUploading(false) // Stop the upload process
                })
                .catch((err) => {
                    console.log(err)
                    setIsUploading(false) // Stop the upload process
                })
        }
    }

    const handleButtonClick = () => {
        document.getElementById('hidden-zip-input')?.click()
    }

    const handleFileChange = (event: any) => {
        const file = event.target.files[0]
        if (file) {
            setFile(file)
            setFileName(file.name)
        }
    }

    const handleCloseModal = () => {
        setShowModal(false) // Close the modal when OK button is clicked
    }

    return (
        <div className="flex flex-col">
            <input
                id="hidden-zip-input"
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            {fileName && <p>Selected File: {fileName}</p>}
            <button onClick={handleButtonClick}>
                {fileName ? 'Change Zip File' : 'Upload Zip File'}
            </button>
            <button
                onClick={handleLoadDataset}
                className={fileName ? 'block' : 'hidden'}
            >
                Load Dataset
            </button>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-1/3 rounded-lg bg-white p-6 text-center shadow-lg">
                        {isUploading && (
                            <div className="flex items-center justify-center">
                                <div className="h-16 w-16 animate-spin justify-center rounded-full border-b-4 border-t-4 border-solid border-blue-500"></div>
                            </div>
                        )}
                        <p className="mt-4">
                            {isUploading
                                ? 'Uploading and Extracting...'
                                : 'Upload Complete!'}
                        </p>
                        {!isUploading && (
                            <button
                                onClick={handleCloseModal}
                                className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white"
                            >
                                OK
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default DatasetLoader
