import React, { useEffect, useState } from 'react'
import MidiPlayer from '@/Components/MidiPlayer'
import WavMp3Player from '@/Components/WavMp3Player'

const API_URL = import.meta.env.VITE_API_URL

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
                                API_URL + '/fetch/midi/' + track.audio_path
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
                                API_URL + '/fetch/audio/' + track.audio_path
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
                    className="flex flex-col items-center justify-between rounded-lg bg-gray-50/50 p-4 shadow-lg md:flex-row"
                >
                    <div className="flex w-full flex-col items-center md:flex-row">
                        <div className="flex flex-col items-center md:flex-row">
                            <div className="hidden min-w-12 md:ml-5 md:mr-5 md:inline">
                                <p className="text-6xl">{index + 1}</p>
                            </div>
                            <img
                                src={API_URL + '/fetch/img/' + track.cover_path}
                                alt={track.name}
                                className="h-48 min-w-48 max-w-48 rounded-full object-cover"
                            />
                        </div>

                        <div className="flex w-full flex-col text-center md:ml-8 md:items-center md:text-left">
                            <h3 className="break-words text-center text-lg font-bold">
                                {removeExtension(track.name)}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {track.artist}
                            </p>
                            <p>.{track.audio_type}</p>
                            {audioFiles[index] &&
                            (track.audio_type === 'wav' ||
                                track.audio_type === 'mp3') ? (
                                <div className="flex max-w-full">
                                    <audio
                                        className="min-w-full max-w-full"
                                        src={
                                            API_URL +
                                            '/fetch/audio/' +
                                            track.audio_path
                                        }
                                        controls
                                    />
                                </div>
                            ) : audioFiles[index] ? (
                                <div className="flex max-w-full">
                                    <MidiPlayer midiFile={audioFiles[index]} />
                                </div>
                            ) : (
                                <p>Loading Audio...</p>
                            )}
                        </div>
                    </div>

                    <div className="flex w-1/2 flex-row justify-between md:w-fit">
                        <strong className="md:hidden">#{index + 1}</strong>
                        <p className="">{Number(track.score).toFixed(2)}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default QueryResultCard
