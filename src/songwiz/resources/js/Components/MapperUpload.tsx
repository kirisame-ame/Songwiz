import React, { useState } from 'react'
import axios from 'axios'

function MapperUpload() {
    const [fileName, setFileName] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isModalMinimized, setIsModalMinimized] = useState(false)
    const [isUploadComplete, setIsUploadComplete] = useState(false)
    const handleFileChange = (event: any) => {
        const file = event.target.files[0]
        if (file) {
            setFile(file)
            setFileName(file.name)
        }
    }
    const handleButtonClick = () => {
        document.getElementById('hidden-mapper-input')?.click()
    }
    const handleLoadMapper = async () => {
        if (file) {
            setIsUploading(true)
            const formData = new FormData()
            formData.append('file', file)

            try {
                await axios.post('/upload-json', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                console.log('Upload complete')
                setIsUploadComplete(true)
            } catch (err) {
                console.error('Upload failed', err)
            } finally {
                setIsUploading(false)
            }
        }
    }
    const handleDownloadMapper = async () => {
        try {
            const response = await axios.get('/download-json', {
                responseType: 'blob',
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'mapper.json')
            document.body.appendChild(link)
            link.click()
        } catch (err) {
            console.error('Download failed', err)
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
            <input
                id="hidden-mapper-input"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            {fileName && <p>Selected File: {fileName}</p>}

            <button onClick={handleButtonClick}>
                {fileName ? 'Change Mapper File' : 'Upload Mapper File'}
            </button>
            <button
                onClick={handleLoadMapper}
                className={fileName ? 'block' : 'hidden'}
            >
                Load Mapper
            </button>
            <button onClick={handleDownloadMapper}>Download Mapper</button>
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

export default MapperUpload
