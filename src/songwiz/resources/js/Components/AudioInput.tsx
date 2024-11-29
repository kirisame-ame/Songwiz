import React, { useState } from 'react'
import MidiPlayer from '@/Components/MidiPlayer'
import SearchIcon from '@/svg/SearchIcon'

function CustomFileInput() {
    const [fileName, setFileName] = useState('')
    const [previewUrl, setPreviewUrl] = useState('')
    const [midiFile, setMidiFile] = useState<File | null>(null)

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

    // Handle MIDI playback (play, stop, clear sequence)

    return (
        <div className="">
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
            <div
                className={`flex w-full items-center justify-center pt-2 ${previewUrl || midiFile ? '' : 'hidden'}`}
            >
                <button className="border-1 flex items-center rounded-md bg-white px-5 text-3xl text-black transition duration-200 hover:scale-150">
                    <SearchIcon />
                    <p>Search</p>
                </button>
            </div>
        </div>
    )
}

export default CustomFileInput
