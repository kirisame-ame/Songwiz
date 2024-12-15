import { on } from 'events';
import React, { useState } from 'react';

interface SongCardProps {
    image: string;
    title: string;
    onPlay: () => void;
}

const SongCard: React.FC<SongCardProps> = ({ image, title, onPlay }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayClick = () => {
        setIsPlaying(!isPlaying);
        onPlay();
    };

    return (
        <div className="rounded-lg shadow-lg overflow-hidden">
            <img src={image} alt={title} className="w-full md:h-60 sm:h-48 object-cover" />
            <div className="p-4 text-center">
                <h3 className="text-lg font-bold">{title}</h3>
            </div>
            <div className="mb-4 flex items-center justify-center">
                <button
                    onClick={handlePlayClick}
                    className=" text-white rounded-full p-2"
                >
                    <img 
                        src={isPlaying? "../../images/pause.png" : "../../images/play.png"}
                        alt={isPlaying? "Pause" : "Play"} 
                        className="w-6" />

                </button>
            </div>
        </div>
    );
};

export default SongCard;