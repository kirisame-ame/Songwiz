import React, { useState , useEffect, useRef} from 'react'
import MidiPlayer from '@/Components/MidiPlayer'
import SearchIcon from '@/svg/SearchIcon'

interface TrackDataProps {
    setTrackData: (trackData: any[]) => void
}
const CustomFileInput: React.FC<TrackDataProps> = ({ setTrackData }) => {
    const [fileName, setFileName] = useState('')
    const [previewUrl, setPreviewUrl] = useState('')
    const [midiFile, setMidiFile] = useState<File | null>(null)
    const [recordedAudioUrl, setRecordedAudioUrl] = useState('')
    const [isRecording, setIsRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [countdown, setCountdown] = useState(10) // Waktu mundur (10 detik)

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
                const url = URL.createObjectURL(file)
                setPreviewUrl(url) // Audio playback URL
                setMidiFile(null) // Clear MIDI file if audio is selected
            } else if (
                file.name.endsWith('.midi') ||
                file.name.endsWith('.mid')
            ) {
                setPreviewUrl('') // Clear audio preview
                setMidiFile(file) // Store the MIDI file for playback
            } else {
                setPreviewUrl('') // Clear any preview URL for unsupported file types
                setMidiFile(null)
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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
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

    return  (
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
                {fileName && <p>Selected File: {fileName}</p>}

                {/* Custom button to trigger file input */}
                <button
                    onClick={handleButtonClick}
                    className="border-1 rounded-md px-5 text-3xl text-black transition duration-200 hover:scale-150"
                >
                    {previewUrl || midiFile ? 'Change File' : 'Upload File'}
                </button>

                {/* Search button after file selection */}
                <div className={`flex w-full items-center justify-center pt-2 ${previewUrl || midiFile ? '' : 'hidden'}`}>
                    <button className="border-1 flex items-center rounded-md bg-white px-5 text-3xl text-black transition duration-200 hover:scale-150">
                        <SearchIcon />
                        <p>Search</p>
                    </button>
                </div>
            </div>

            {/* Right Section: Image */}
            <div className="flex flex-col justify-center items-center text-center">
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
                    <p className="text-red-500 text-xl mt-2">Recording...{countdown}s</p>
                )}

                {/* Display recorded audio player */}
                {recordedAudioUrl && (
                    <div className="flex items-center justify-center pt-4">
                        <audio src={recordedAudioUrl} controls />
                    </div>
                )}

            </div>
        </div>
    )
}

export default CustomFileInput
