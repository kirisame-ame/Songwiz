import React from 'react'
import MidiPlayer from '@/Components/MidiPlayer'
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

const QueryResultCard: React.FC<QueryResultCardProps> = ({ trackData }) => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trackData.map((track, index) => (
                <div
                    key={index}
                    className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow-lg"
                >
                    <img
                        src={'uploads/img/' + track.cover_path}
                        alt={track.name}
                        className="h-48 w-48 rounded-full object-cover"
                    />
                    <h3 className="text-lg font-bold">{track.name}</h3>
                    <p className="text-sm text-gray-500">{track.artist}</p>
                    <p>{track.audio_type}</p>
                    <p>{track.score}</p>
                    {track.audio_type === 'wav' ||
                    track.audio_type === 'mp3' ? (
                        <audio controls>
                            <source
                                src={'uploads/audio/' + track.audio_path}
                                type="audio/mpeg"
                            />
                            Your browser does not support the audio element.
                        </audio>
                    ) : (
                        <p>midi WIP</p>
                    )}
                </div>
            ))}
        </div>
    )
}
export default QueryResultCard
