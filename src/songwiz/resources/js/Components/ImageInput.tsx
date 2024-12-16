import React, { useState } from 'react'
import SearchIcon from '@/svg/SearchIcon'
import axios from 'axios'

interface TrackDataProps {
    setTrackData: (trackData: any[]) => void
}
interface TrackData {
    name: string
    artist: string
    cover_path: string
    audio_path: string
    audio_type: string
    score: number
}

const CustomFileInput: React.FC<TrackDataProps> = ({ setTrackData }) => {
    const [file, setFile] = useState<File | null>(null)
    const [fileName, setFileName] = useState('')
    const [previewUrl, setPreviewUrl] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [isModalMinimized, setIsModalMinimized] = useState(false)
    const [isUploadComplete, setIsUploadComplete] = useState(false)

    // Handle file change
    const handleFileChange = (event: any) => {
        const selectedFile = event.target.files[0]
        if (selectedFile) {
            setFile(event.target.files[0])
            setFileName(selectedFile.name) // Update the file name display
            if (selectedFile.type.startsWith('image/')) {
                const url = URL.createObjectURL(selectedFile)
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
    const handleImageQuery = async () => {
        if (file) {
            setIsUploading(true)
            const formData = new FormData()
            formData.append('file', file)
            try {
                const response = await axios.post('/image-query', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                const data = response.data
                const trackData: TrackData[] = []
                Object.keys(data).forEach((key) => {
                    const trackArray = data[key] // Assuming this is an array of track objects
                    trackArray.forEach((track: any) => {
                        console.log('Track:', track) // Log each track object
                        trackData.push({
                            name: track['name'],
                            artist: track['artist'],
                            cover_path: track['cover_path'],
                            audio_path: track['audio_path'],
                            audio_type: track['audio_type'],
                            score: 0,
                        })
                    })
                })
                console.log(trackData)
                setTrackData(trackData)
                setIsUploadComplete(true)
                console.log('Upload complete')
            } catch (err) {
                console.error('Upload failed', err)
            } finally {
                setIsUploading(false)
            }
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
                <button
                    onClick={handleImageQuery}
                    className="border-1 flex items-center rounded-md bg-white px-5 text-3xl text-black transition duration-200 hover:scale-150"
                >
                    <SearchIcon />
                    <p>Search</p>
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
                                <p>Finished Querying</p>
                            ) : isModalMinimized ? (
                                <p>Querying in background...</p>
                            ) : (
                                <p>Querying... Please wait</p>
                            )}

                            <div className="mt-4 flex items-center justify-center">
                                {!isUploadComplete && !isModalMinimized && (
                                    <div
                                        className="mr-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent"
                                        role="status"
                                    ></div>
                                )}
                                {isUploadComplete ? (
                                    <button
                                        onClick={closeModal}
                                        className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                                    >
                                        OK
                                    </button>
                                ) : (
                                    <button
                                        onClick={toggleModalMinimize}
                                        className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                                    >
                                        {isModalMinimized
                                            ? 'Restore'
                                            : 'Minimize'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Style for the custom button

export default CustomFileInput
