import React, { useEffect, useRef, useState } from 'react'

interface MidiPlayerProps {
    midiFile: File | null // Receive midiFile as a prop
}

const MidiPlayer: React.FC<MidiPlayerProps> = ({ midiFile }) => {
    const playerRef = useRef<HTMLDivElement | null>(null) // Reference to wrap the midi player component
    const [scriptLoaded, setScriptLoaded] = useState(false) // Track if the script has loaded
    const [midiUrl, setMidiUrl] = useState<string | null>(null) // State to store object URL for the midi file

    useEffect(() => {
        // Dynamically load the external scripts
        const script = document.createElement('script')
        script.src =
            'https://cdn.jsdelivr.net/combine/npm/tone@14.7.58,npm/@magenta/music@1.23.1/es6/core.js,npm/focus-visible@5,npm/html-midi-player@1.5.0'
        script.async = true
        script.onload = () => {
            console.log('External script loaded')
            setScriptLoaded(true) // Mark script as loaded
        }
        script.onerror = () => {
            console.error('Error loading external script')
            setScriptLoaded(false)
        }
        document.body.appendChild(script) // Append the script tag to the body to load it
        return () => {
            document.body.removeChild(script) // Cleanup when component unmounts
        }
    }, [])

    useEffect(() => {
        // If midiFile is available, create object URL for it
        if (midiFile) {
            const url = URL.createObjectURL(midiFile)
            setMidiUrl(url)
        }
    }, [midiFile])

    useEffect(() => {
        // Once the script is loaded, create the midi-player and midi-visualizer
        if (scriptLoaded && playerRef.current && midiUrl) {
            const midiPlayer = document.createElement('midi-player')
            midiPlayer.setAttribute('src', midiUrl) // Use the midiUrl here
            midiPlayer.setAttribute(
                'sound-font',
                'https://storage.googleapis.com/magentadata/js/soundfonts/salamander'
            )
            midiPlayer.setAttribute('visualizer', '#myVisualizer')
            playerRef.current.appendChild(midiPlayer)

            // Cleanup old midi player and visualizer if re-rendered
            return () => {
                if (playerRef.current) {
                    playerRef.current.innerHTML = ''
                }
            }
        }
    }, [scriptLoaded, midiUrl])

    return (
        <div>
            <div ref={playerRef}></div>{' '}
            {/* This will hold the midi player and visualizer */}
        </div>
    )
}

export default MidiPlayer
