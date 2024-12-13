import React, { useEffect, useRef, useState } from 'react'

interface MidiPlayerProps {
    midiFile: File | null // Receive midiFile as a prop
}

const MidiPlayer: React.FC<MidiPlayerProps> = ({ midiFile }) => {
    const containerRef = useRef<HTMLDivElement | null>(null) // Reference to wrap the midi player container
    const [scriptLoaded, setScriptLoaded] = useState(false) // Track if the script has loaded
    const [midiUrl, setMidiUrl] = useState<string | null>(null) // State to store object URL for the midi file
    const midiPlayerRef = useRef<any | null>(null) // Reference to the midi player instance

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
            document.body.removeChild(script) // Cleanup the script on unmount
        }
    }, [])

    useEffect(() => {
        // If midiFile is available, create object URL for it
        if (midiFile) {
            const url = URL.createObjectURL(midiFile)
            setMidiUrl(url)
        }

        return () => {
            // Cleanup the previous object URL
            if (midiUrl) {
                URL.revokeObjectURL(midiUrl)
                setMidiUrl(null)
            }
        }
    }, [midiFile])

    useEffect(() => {
        // Once the script is loaded, create the MIDI player
        if (scriptLoaded && containerRef.current && midiUrl) {
            // Remove any previous MIDI player
            containerRef.current.innerHTML = ''

            // Create and configure a new MIDI player
            const midiPlayer = document.createElement('midi-player')
            midiPlayer.setAttribute('src', midiUrl)
            midiPlayer.setAttribute(
                'sound-font',
                'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus'
            )
            midiPlayer.setAttribute('visualizer', '#myVisualizer')
            containerRef.current.appendChild(midiPlayer)

            // Store the reference to the player
            midiPlayerRef.current = midiPlayer

            // Cleanup the MIDI player on re-render
            return () => {
                // Stop playback if the player exists
                if (midiPlayerRef.current) {
                    midiPlayerRef.current.stop?.()
                    midiPlayerRef.current = null
                }

                if (containerRef.current) {
                    containerRef.current.innerHTML = ''
                }
            }
        }
    }, [scriptLoaded, midiUrl])

    return (
        <div>
            <div ref={containerRef}></div>
        </div>
    )
}

export default MidiPlayer
