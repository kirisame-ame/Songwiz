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
            const formData = new FormData()
            formData.append('file', file)
            try {
                const response = await axios.post('/image-query', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                const data = response.data
                const trackData: TrackData[] = []
                let i: number = 0
                Object.keys(data).forEach((key) => {
                    const track = data[key]
                    trackData.push({
                        name: track[i]['name'],
                        artist: track[i]['artist'],
                        cover_path: track[i]['cover_path'],
                        audio_path: track[i]['audio_path'],
                        audio_type: track[i]['audio_type'],
                        score: 0,
                    })
                    i += 1
                })
                console.log(trackData)
                setTrackData(trackData)
                console.log('Upload complete')
            } catch (err) {
                console.error('Upload failed', err)
            }
        }
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
            </div>
        </div>
    )
}

// Style for the custom button

export default CustomFileInput
