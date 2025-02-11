import React, { useEffect, useRef, useState } from 'react'

interface WavMp3PlayerProps {
    audioFile: File | null
}

// Global variable to keep track of the currently playing audio
let currentAudio: HTMLAudioElement | null = null

const WavMp3Player: React.FC<WavMp3PlayerProps> = ({ audioFile }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    useEffect(() => {
        if (audioFile && audioRef.current) {
            const url = URL.createObjectURL(audioFile)
            audioRef.current.src = url

            return () => {
                URL.revokeObjectURL(url)
            }
        }
    }, [audioFile])

    useEffect(() => {
        if (isPlaying && audioRef.current) {
            if (currentAudio && currentAudio !== audioRef.current) {
                currentAudio.pause()
            }
            currentAudio = audioRef.current
            audioRef.current.play()
        } else {
            audioRef.current?.pause()
        }
    }, [isPlaying])

    useEffect(() => {
        const handlePlay = () => {
            if (currentAudio && currentAudio !== audioRef.current) {
                currentAudio.pause()
            }
            currentAudio = audioRef.current
            setIsPlaying(true)
        }

        const handlePause = () => {
            setIsPlaying(false)
        }

        const audioElement = audioRef.current
        if (audioElement) {
            audioElement.addEventListener('play', handlePlay)
            audioElement.addEventListener('pause', handlePause)
        }

        return () => {
            if (audioElement) {
                audioElement.removeEventListener('play', handlePlay)
                audioElement.removeEventListener('pause', handlePause)
            }
        }
    }, [])

    return (
        <div className="flex justify-center">
            <audio
                ref={audioRef}
                controls
                style={{ width: '100%', maxWidth: '280px', maxHeight: '40px' }}
            />
        </div>
    )
}

export default WavMp3Player
