import React, { useState } from 'react'
import axios from 'axios'
import UpArrowIcon from '@/svg/UpArrowIcon'
import FileUploader from '@/Components/FileUploader'

const API_URL = import.meta.env.VITE_API_URL
function DatasetLoader() {
    const [isUploading, setIsUploading] = useState(false)
    const [isModalMinimized, setIsModalMinimized] = useState(false)
    const [isUploadComplete, setIsUploadComplete] = useState(false)

    const handleProcessDataset = async () => {
        setIsUploading(true)
        try {
            await axios.post(API_URL + '/process')
            console.log('Processing complete')
            setIsUploadComplete(true)
        } catch (err) {
            console.error('Processing failed', err)
        } finally {
            setIsUploading(false)
        }
    }

    const toggleModalMinimize = () => {
        setIsModalMinimized(!isModalMinimized)
    }

    const closeModal = () => {
        setIsUploading(false)
        setIsModalMinimized(false)
        setIsUploadComplete(false)
    }

    return (
        <div className="flex flex-row items-center gap-x-10">
            <FileUploader />
            <button
                onClick={handleProcessDataset}
                className="border-1 flex items-center rounded-md bg-white px-2 text-lg text-black transition duration-200 hover:scale-110"
            >
                <UpArrowIcon />
                <p>Process Dataset</p>
            </button>
            {(isUploading || isUploadComplete) && (
                <div
                    className={`fixed ${
                        isModalMinimized
                            ? 'bottom-4 right-4 h-12 w-48'
                            : 'left-0 top-0 h-full w-full'
                    } flex items-center justify-center bg-gray-700 bg-opacity-50 transition-all`}
                >
                    <div
                        className={`rounded-lg bg-white p-6 shadow-lg ${
                            isModalMinimized
                                ? 'flex items-center justify-between'
                                : 'flex flex-col'
                        }`}
                    >
                        {isUploadComplete ? (
                            <p>Finished Uploading</p>
                        ) : isModalMinimized ? (
                            <p>Uploading in background...</p>
                        ) : (
                            <p>Uploading... Please wait</p>
                        )}

                        <div className="mt-4 flex justify-center">
                            {!isUploadComplete && !isModalMinimized && (
                                <div
                                    className="h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent"
                                    role="status"
                                ></div>
                            )}
                            {isUploadComplete ? (
                                <button
                                    onClick={closeModal}
                                    className="ml-4 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                                >
                                    OK
                                </button>
                            ) : (
                                <button
                                    onClick={toggleModalMinimize}
                                    className="ml-4 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                                >
                                    {isModalMinimized ? 'Restore' : 'Minimize'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DatasetLoader
