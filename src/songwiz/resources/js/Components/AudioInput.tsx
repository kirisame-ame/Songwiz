import React, { useState, useEffect, useRef } from 'react'
import MidiPlayer from '@/Components/MidiPlayer'
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
    const [fileName, setFileName] = useState('')
    const [previewUrl, setPreviewUrl] = useState('')
    const [audioFile, setAudioFile] = useState<File | null>(null)
    const [midiFile, setMidiFile] = useState<File | null>(null)
    const [recordedAudioUrl, setRecordedAudioUrl] = useState('')
    const [isRecording, setIsRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    )
    const [countdown, setCountdown] = useState(10) // Waktu mundur (10 detik)
    const [isUploading, setIsUploading] = useState(false)
    const [isModalMinimized, setIsModalMinimized] = useState(false)
    const [isUploadComplete, setIsUploadComplete] = useState(false)

    const handleAudioQuery = async () => {
        if (midiFile) {
            setIsUploading(true)
            const formData = new FormData()
            formData.append('file', midiFile)
            try {
                const response = await axios.post('/midi-query', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                const data = response.data
                console.log(data)
                const trackData: TrackData[] = []
                Object.keys(data).forEach((key) => {
                    const trackArray = data[key] // Assuming this is an array of track objects
                    trackArray.forEach((track: any) => {
                        trackData.push({
                            name: track['name'],
                            artist: track['artist'],
                            cover_path: track['cover_path'],
                            audio_path: track['audio_path'],
                            audio_type: track['audio_type'],
                            score: track['score'],
                        })
                    })
                })
                setTrackData(trackData)
                setIsUploadComplete(true)
                console.log('Upload complete')
            } catch (err) {
                console.error('Upload failed', err)
            } finally {
                setIsUploading(false)
            }
        } else if (audioFile) {
            setIsUploading(true)
            const formData = new FormData()
            formData.append('file', audioFile)
            try {
                const response = await axios.post('/audio-query', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                const data = response.data
                console.log(data)
                const trackData: TrackData[] = []
                Object.keys(data).forEach((key) => {
                    const trackArray = data[key] // Assuming this is an array of track objects
                    console.log('Track Array:', trackArray)
                    trackArray.forEach((track: any) => {
                        console.log('Track:', track) // Log each track object
                        trackData.push({
                            name: track['name'],
                            artist: track['artist'],
                            cover_path: track['cover_path'],
                            audio_path: track['audio_path'],
                            audio_type: track['audio_type'],
                            score: track['score'],
                        })
                    })
                })
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
    // Handle file change (audio or midi)
    const handleFileChange = (event: any) => {
        const file = event.target.files[0]
        if (file) {
            setFileName(file.name) // Update the file name display
            // Check if the file is audio or midi
            if (
                file.type.startsWith('audio/mpeg') ||
                file.type.startsWith('audio/wav')
            ) {
                setAudioFile(file)
                const url = URL.createObjectURL(file)
                setPreviewUrl(url)
                setMidiFile(null)
            } else if (
                file.name.endsWith('.midi') ||
                file.name.endsWith('.mid')
            ) {
                setPreviewUrl('') // Clear audio preview
                setAudioFile(null)
                setMidiFile(file) // Store the MIDI file for playback
            } else {
                setPreviewUrl('') // Clear any preview URL for unsupported file types
                setMidiFile(null)
                setAudioFile(null)
            }
        }
    }

    // Trigger file input click when custom button is clicked
    const handleButtonClick = () => {
        // @ts-ignore
        document.getElementById('hidden-file-input').click()
    }
    // Handle Audio Recording
    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        })
        const recorder = new MediaRecorder(stream)
        const chunks: Blob[] = []

        recorder.ondataavailable = (event) => {
            chunks.push(event.data)
        }

        recorder.onstop = () => {
            const audioBlob = new Blob(chunks, { type: 'audio/wav' })
            const audioUrl = URL.createObjectURL(audioBlob)
            setRecordedAudioUrl(audioUrl) // Set the recorded audio URL for playback
            setIsRecording(false) // Reset recording state
            setMediaRecorder(null) // Reset MediaRecorder instance
        }

        recorder.start()
        setIsRecording(true)
        setMediaRecorder(recorder)
        // Start countdown timer
        let timeLeft = 10
        setCountdown(timeLeft)
        const timer = setInterval(() => {
            setCountdown(timeLeft)

            if (timeLeft <= 0) {
                clearInterval(timer) // Stop the timer
                recorder.stop() // Stop recording
            }
            timeLeft -= 1
        }, 1000)
    }

    // Clean up object URL when component unmounts or preview URL changes
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
            if (recordedAudioUrl) {
                URL.revokeObjectURL(recordedAudioUrl)
            }
        }
    }, [previewUrl, recordedAudioUrl])
    // Handle MIDI playback (play, stop, clear sequence)

    return (
        <div className="flex w-full justify-around">
            {/* Left section for file upload */}
            <div className="flex flex-col p-4">
                <h2>Upload File</h2>
                {/* Display audio player if audio file is selected */}
                {previewUrl && !midiFile && (
                    <div className="flex items-center justify-center">
                        <audio src={previewUrl} controls />
                    </div>
                )}

                {/* Display MIDI playback button if a MIDI file is selected */}
                {midiFile && !previewUrl && (
                    <div className="flex items-center justify-center">
                        <MidiPlayer midiFile={midiFile} />
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    id="hidden-file-input"
                    type="file"
                    accept=".mp3,.wav,.midi,.mid"
                    onChange={handleFileChange}
                    style={{ display: 'none' }} // Hide the default file input
                />

                {/* Display selected file name */}
                {fileName && (
                    <div className='max-w-sm'>
                        <p>Selected File: {fileName}</p>
                    </div>
                    )}

                {/* Custom button to trigger file input */}
                <button
                    onClick={handleButtonClick}
                    className="border-1 rounded-md px-5 text-3xl text-black transition duration-200 hover:scale-150"
                >
                    {previewUrl || midiFile ? 'Change File' : 'Upload File'}
                </button>

                {/* Search button after file selection */}
                <div
                    className={`flex w-full items-center justify-center pt-2 ${previewUrl || midiFile ? '' : 'hidden'}`}
                >
                    <button
                        onClick={handleAudioQuery}
                        className="border-1 flex items-center rounded-md bg-white px-5 text-3xl text-black transition duration-200 hover:scale-150"
                    >
                        <SearchIcon />
                        <p>Search</p>
                    </button>
                </div>
            </div>

            {/* Right Section: Image */}
            <div className="flex flex-col items-center justify-center text-center">
                <h2>Record Audio</h2>

                {/* Audio Recording Controls */}
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        className="border-1 rounded-md px-5 text-3xl text-black transition duration-200 hover:scale-150"
                    >
                        Start Recording
                    </button>
                ) : (
                    <p className="mt-2 text-xl text-red-500">
                        Recording...{countdown}s
                    </p>
                )}

                {/* Display recorded audio player */}
                {recordedAudioUrl && (
                    <div className="flex items-center justify-center pt-4">
                        <audio src={recordedAudioUrl} controls />
                    </div>
                )}
            </div>
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

export default CustomFileInput
