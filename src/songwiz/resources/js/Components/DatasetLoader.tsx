import React, { useState } from 'react'
import axios from 'axios'
import UpArrowIcon from '@/svg/UpArrowIcon'
import { FileUploader } from '@/Components/FileUploader'

const API_URL = 'http://noogs4okgk04gww40g8g0sw0.140.245.62.251.sslip.io'
function DatasetLoader() {
    const [fileName, setFileName] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isModalMinimized, setIsModalMinimized] = useState(false)
    const [isUploadComplete, setIsUploadComplete] = useState(false)

    const handleLoadDataset = async () => {
        if (file) {
            setIsUploading(true) // Show modal and spinner
            const formData = new FormData()
            formData.append('file', file)

            try {
                await axios.post(API_URL + '/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                console.log('Upload complete')
                setIsUploadComplete(true) // Mark upload as complete
            } catch (err) {
                console.error('Upload failed', err)
            } finally {
                setIsUploading(false) // Hide spinner
            }
        }
    }

    const handleProcessDataset = async () => {
        setIsUploading(true)
        try {
            await axios.post('/cache')
            console.log('Processing complete')
            setIsUploadComplete(true)
        } catch (err) {
            console.error('Processing failed', err)
        } finally {
            setIsUploading(false)
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

    const toggleModalMinimize = () => {
        setIsModalMinimized(!isModalMinimized)
    }

    const closeModal = () => {
        setIsUploading(false)
        setIsModalMinimized(false)
        setIsUploadComplete(false)
    }

    // @ts-ignore
    return (
        <div className="flex flex-row items-center gap-x-10">
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
            <FileUploader fileTypes={['application/zip']} />
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
