import { Link } from '@inertiajs/react'
import NavLink from '@/Components/NavLink'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SongCard from '@/Components/SongCard'

// unauthenticated user can access this page
export default function Database() {
    const [tracks, setTracks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => {
        fetchTracks(currentPage);
    }, [currentPage]);

    const fetchTracks = async (page: number) => {
        try {
            const response = await axios.get(`/index?page=${page}`);
            setTracks(response.data.data);
            setCurrentPage(response.data.current_page);
            setLastPage(response.data.last_page);
        } catch (error) {
            console.error('Error fetching tracks:', error);
        }
    };

    const handleNextPage = () => {
        if (currentPage < lastPage) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="min-h-screen pb-4 bg-[url('/images/background.jpeg')] bg-cover pt-3 text-black/70">
            <nav className="">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <img
                                        alt="Logo"
                                        src="/images/logo.png"
                                        className="w-40"
                                    />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                {/* <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink> */}
                                <NavLink
                                    href={'/'}
                                    active={route().current('/')}
                                >
                                    Home
                                </NavLink>

                                <NavLink
                                    href={route('database')}
                                    active={route().current('database')}
                                >
                                    Database
                                </NavLink>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        {tracks.map((track: any) => (
                            <SongCard
                                key={track.id}
                                image={'uploads/img/'+track.cover_path}
                                title={track.name}
                                onPlay={() => console.log('Playing', track.name)}
                            />
                        ))}

                    </div>
                    <div className="mt-6 mb-4 flex justify-center">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === lastPage}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md ms-2 hover:bg-blue-600 cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    )
}
