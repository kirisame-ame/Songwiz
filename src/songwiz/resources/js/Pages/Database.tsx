import { Link } from '@inertiajs/react'
import NavLink from '@/Components/NavLink'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SongCard from '@/Components/SongCard'
import SearchIcon from '@/svg/SearchIcon'

const API_URL = 'http://noogs4okgk04gww40g8g0sw0.140.245.62.251.sslip.io'
// unauthenticated user can access this page
export default function Database() {
    const [tracks, setTracks] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [lastPage, setLastPage] = useState(1)
    const [sortOption, setSortOption] = useState('name')
    const [query, setQuery] = useState('')

    useEffect(() => {
        fetchTracks(currentPage, sortOption)
    }, [currentPage, sortOption])

    const fetchTracks = async (page: number, sort: string) => {
        try {
            const response = await axios.get(`/index?page=${page}&sort=${sort}`)
            setTracks(response.data.data)
            setCurrentPage(response.data.current_page)
            setLastPage(response.data.last_page)
        } catch (error) {
            console.error('Error fetching tracks:', error)
        }
    }
    const handleSearchQuery = async () => {
        if (query === '') {
            fetchTracks(currentPage, sortOption)
            return
        }
        try {
            const response = await axios.get(`/search?query=${query}`)
            setTracks(response.data.data)
            setCurrentPage(response.data.current_page)
            setLastPage(response.data.last_page)
        } catch (error) {
            console.error('Error fetching tracks:', error)
        }
    }

    const handleNextPage = () => {
        if (currentPage < lastPage) {
            setCurrentPage(currentPage + 1)
        }
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const removeExtension = (filename: string) => {
        return filename.split('.').slice(0, -1).join('.')
    }

    return (
        <div className="min-h-screen bg-[url('/images/background.jpeg')] bg-cover pb-4 pt-3 text-black/70">
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
                    <div className="mt-5 flex flex-row items-center">
                        <input
                            className="rounded-l-md border-0 bg-gray-50 pr-9 focus:border-transparent focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:ring-offset-transparent"
                            type="text"
                            placeholder="Search title or artist"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearchQuery()
                                }
                            }}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button
                            onClick={handleSearchQuery}
                            className="border-1 flex items-center rounded-r-md bg-white px-5 py-1 text-xl text-black transition duration-200 hover:ring-1"
                        >
                            <SearchIcon />
                        </button>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="ml-4 rounded-md border border-gray-300 bg-gray-50"
                        >
                            <option value="name">Name</option>
                            <option value="artist">Artist</option>
                            <option value="date">Date</option>
                        </select>
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        {tracks.map((track: any) => (
                            <SongCard
                                key={track.id}
                                image={
                                    API_URL + '/fetch/img/' + track.cover_path
                                }
                                title={removeExtension(track.name)}
                                artist={track.artist}
                                audio_type={track.audio_type}
                                audio_path={track.audio_path}
                                onPlay={() =>
                                    console.log('Playing', track.name)
                                }
                            />
                        ))}
                    </div>
                    <div className="mb-4 mt-6 flex justify-center">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === lastPage}
                            className="ms-2 cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    )
}
