import { on } from 'events'
import React, { useState, useEffect } from 'react'
import MidiPlayer from './MidiPlayer'
import WavMp3Player from './WavMp3Player'

const API_URL = import.meta.env.VITE_API_URL

interface SongCardProps {
    image: string
    title: string
    artist: string
    audio_type: string
    audio_path: string
    onPlay: () => void
}

const SongCard: React.FC<SongCardProps> = ({
    image,
    title,
    artist,
    audio_type,
    audio_path,
    onPlay,
}) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [audioFile, setAudioFile] = useState<File | null>(null)

    const handlePlayClick = () => {
        setIsPlaying(!isPlaying)
        onPlay()
    }

    const getAudioTypeStyle = (type: string) => {
        if (type === 'midi' || type === 'mid') {
            return {
                backgroundColor: '#FFD700',
                padding: '2px 8px',
                borderRadius: '4px',
                color: '#000',
            }
        } else {
            return {
                backgroundColor: '#1E90FF',
                padding: '2px 8px',
                borderRadius: '4px',
                color: '#fff',
            }
        }
    }

    const getAudioPath = (audio_type: string, audio_path: string) => {
        if (audio_type === 'midi' || audio_type === 'mid') {
            return `${API_URL}/fetch/midi/${audio_path}`
        } else if (audio_type === 'mp3' || audio_type === 'wav') {
            return `${API_URL}/fetch/audio/${audio_path}`
        }
        return audio_path
    }

    useEffect(() => {
        if (
            isPlaying &&
            (audio_type === 'midi' ||
                audio_type === 'mid' ||
                audio_type === 'wav' ||
                audio_type === 'mp3')
        ) {
            const path = getAudioPath(audio_type, audio_path)
            fetch(path)
                .then((response) => response.blob())
                .then((blob) => {
                    const file = new File([blob], `audio.${audio_type}`, {
                        type: `audio/${audio_type}`,
                    })
                    setAudioFile(file)
                })
                .catch((error) => {
                    console.error('Error fetching audio file:', error)
                })
        }
    }, [isPlaying, audio_type, audio_path])

    return (
        <div className="overflow-hidden rounded-lg shadow-lg">
            <img src={image} alt={title} className="h-40 w-full object-cover" />
            <div className="pt-2 text-center">
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm text-gray-500">
                    {artist}{' '}
                    <span
                        className="mx-2"
                        style={getAudioTypeStyle(audio_type)}
                    >
                        {audio_type}
                    </span>
                </p>
            </div>
            <div className="flex items-center justify-center">
                {isPlaying &&
                    (audio_type === 'midi' || audio_type === 'mid') && (
                        <div className="w-full max-w-xs">
                            <MidiPlayer midiFile={audioFile} />
                        </div>
                    )}

                {isPlaying &&
                    (audio_type === 'wav' || audio_type === 'mp3') && (
                        <div className="w-full max-w-xs">
                            <WavMp3Player audioFile={audioFile} />
                        </div>
                    )}
                {!isPlaying && (
                    <button
                        onClick={handlePlayClick}
                        className="rounded-full p-2 text-white"
                    >
                        <img
                            src={
                                isPlaying
                                    ? '../../images/pause.png'
                                    : '../../images/play.png'
                            }
                            alt={isPlaying ? 'Pause' : 'Play'}
                            className="w-5"
                        />
                    </button>
                )}
            </div>
        </div>
    )
}

export default SongCard
