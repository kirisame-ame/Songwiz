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
                                'uploads/midi/' + track.audio_path
                            )
                            const blob = await response.blob()
                            return new File(
                                [blob],
                                track.audio_path.split('/').pop() || 'file.mid',
                                { type: 'audio/midi' }
                            )
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
                                'uploads/audio/' + track.audio_path
                            )
                            const blob = await response.blob()
                            return new File(
                                [blob],
                                track.audio_path.split('/').pop() || 'file.wav',
                                { type: 'audio/wav' }
                            )
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
                        <div className="flex flex-1 items-center">
                            <p className="flex w-16 text-6xl">{index + 1}</p>
                            <img
                                src={'uploads/img/' + track.cover_path}
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

                    {track.audio_type === 'wav' ||
                    track.audio_type === 'mp3' ? (
                        <WavMp3Player audioFile={audioFiles[index]} />
                    ) : audioFiles[index] ? (
                        <MidiPlayer midiFile={audioFiles[index]} />
                    ) : (
                        <p>Loading MIDI...</p>
                    )}
                    <p>{track.score}</p>
                </div>
            ))}
        </div>
    )
}

export default QueryResultCard
