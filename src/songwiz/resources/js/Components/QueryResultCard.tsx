import React, { useEffect, useState } from 'react'
import MidiPlayer from '@/Components/MidiPlayer'
import WavMp3Player from '@/Components/WavMp3Player'

interface TrackData {
    name: string
    artist: string
    cover_path: string
    audio_path: string
    audio_type: string
    score: number
}

interface QueryResultCardProps {
    trackData: TrackData[]
}

const removeExtension = (filename: string) => {
    return filename.split('.').slice(0, -1).join('.')
}

const QueryResultCard: React.FC<QueryResultCardProps> = ({ trackData }) => {
    const [audioFiles, setAudioFiles] = useState<(File | null)[]>([])

    useEffect(() => {
        const fetchMidiFiles = async () => {
            const files: (File | null)[] = await Promise.all(
                trackData.map(async (track) => {
                    if (
                        track.audio_type === 'mid' ||
                        track.audio_type === 'midi'
                    ) {
                        try {
                            const response = await fetch(
                                'http://localhost:5000/fetch/midi/' +
                                    track.audio_path
                            )
                            const blob = await response.blob()
                            return new File([blob], track.audio_path, {
                                type: 'audio/midi',
                            })
                        } catch (error) {
                            console.error(
                                `Failed to fetch MIDI file: ${track.audio_path}`,
                                error
                            )
                            return null
                        }
                    } else if (
                        track.audio_type === 'wav' ||
                        track.audio_type === 'mp3'
                    ) {
                        try {
                            const response = await fetch(
                                'http://localhost:5000/fetch/audio/' +
                                    track.audio_path
                            )
                            const blob = await response.blob()
                            return new File([blob], track.audio_path, {
                                type: `audio/${track.audio_type}`,
                            })
                        } catch (error) {
                            console.error(
                                `Failed to fetch audio file: ${track.audio_path}`,
                                error
                            )
                            return null
                        }
                    }
                    return null
                })
            )
            setAudioFiles(files)
            console.log('Fetched MIDI files:', files)
        }

        fetchMidiFiles()
    }, [trackData])

    return (
        <div className="flex w-full flex-col gap-y-3 pt-10">
            {trackData.map((track, index) => (
                <div
                    key={index}
                    className="flex flex-row items-center justify-between rounded-lg bg-gray-50/50 p-4 shadow-lg"
                >
                    <div className="flex w-3/4 items-center">
                        <div className="flex items-center">
                            <p className="flex w-16 flex-1 text-6xl">
                                {index + 1}
                            </p>
                            <img
                                src={API_URL + '/fetch/img/' + track.cover_path}
                                alt={track.name}
                                className="h-48 w-48 rounded-full object-cover"
                            />
                        </div>

                        <div className="ml-8 flex-1 items-center">
                            <h3 className="text-lg font-bold">
                                {removeExtension(track.name)}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {track.artist}
                            </p>
                            <p>.{track.audio_type}</p>
                        </div>
                    </div>

                    {audioFiles[index] &&
                    (track.audio_type === 'wav' ||
                        track.audio_type === 'mp3') ? (
                        <audio
                            src={
                                'http://localhost:5000/fetch/audio/' +
                                track.audio_path
                            }
                            controls
                        />
                    ) : audioFiles[index] ? (
                        <MidiPlayer midiFile={audioFiles[index]} />
                    ) : (
                        <p>Loading MIDI...</p>
                    )}
                    <p className="max-w-8 overflow-hidden">{track.score}</p>
                </div>
            ))}
        </div>
    )
}

export default QueryResultCard
