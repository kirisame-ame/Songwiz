import { Head, Link } from '@inertiajs/react'
import NavLink from '@/Components/NavLink'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SongCard from '@/Components/SongCard'
import SearchIcon from '@/svg/SearchIcon'

const API_URL = import.meta.env.VITE_API_URL

export default function Database() {
    const [tracks, setTracks] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [lastPage, setLastPage] = useState(1)
    const [sortOption, setSortOption] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [query, setQuery] = useState('')

    useEffect(() => {
        if (query === '') {
            void fetchTracks(currentPage, sortOption, sortOrder)
        } else {
            void handleSearchQuery(currentPage)
        }
    }, [currentPage, sortOrder])
    useEffect(() => {
        if (query === '') {
            void fetchTracks(1, sortOption, sortOrder)
            setCurrentPage(1)
        } else {
            void handleSearchQuery(currentPage)
        }
    }, [sortOption])
    const fetchTracks = async (page: number, sort: string, order: string) => {
        try {
            const response = await axios.get(
                `/index?page=${page}&sort=${sort}&order=${order}`
            )
            console.log(response.data)
            setTracks(response.data.data)
            setCurrentPage(response.data.current_page)
            setLastPage(response.data.last_page)
        } catch (error) {
            console.error('Error fetching tracks:', error)
        }
    }
    const handleSearchQuery = async (page: number) => {
        if (query === '') {
            await fetchTracks(currentPage, sortOption, sortOrder)
            return
        }
        try {
            const response = await axios.get(
                `/search?query=${query}&page=${page}`
            )
            setTracks(response.data.data)
            setCurrentPage(response.data.current_page)
            setLastPage(response.data.last_page)
        } catch (error) {
            console.error('Error fetching tracks:', error)
        }
    }

    const handleSortOrder = () => {
        if (sortOrder === 'asc') {
            setSortOrder('desc')
            setCurrentPage(1)
        } else {
            setSortOrder('asc')
            setCurrentPage(1)
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
        <>
            <Head title="Database" />
            <div className="min-w-screen min-h-screen overflow-x-hidden bg-[url('/images/background.jpeg')] bg-cover pb-4 pt-3 text-black/70">
                <nav className="">
                    <div className="mx-5 max-w-7xl xl:mx-auto">
                        <div className="flex justify-center md:justify-between">
                            <div className="flex max-h-12">
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
                                    <NavLink
                                        href={route('dashboard')}
                                        active={route().current('dashboard')}
                                    >
                                        Dashboard
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 flex flex-col gap-y-2 sm:flex-row sm:gap-x-4">
                            <div className="flex max-h-8">
                                <input
                                    className="rounded-l-md border-0 bg-gray-50 pr-9 focus:border-transparent focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:ring-offset-transparent"
                                    type="text"
                                    placeholder="Search title or artist"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            void handleSearchQuery(1)
                                        }
                                    }}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <button
                                    onClick={() => handleSearchQuery(1)}
                                    className="border-1 flex items-center rounded-r-md bg-white px-5 py-1 text-xl text-black transition duration-200 hover:ring-1"
                                >
                                    <SearchIcon />
                                </button>
                            </div>
                            <div className="flex items-center gap-x-5">
                                <select
                                    value={sortOption}
                                    onChange={(e) =>
                                        setSortOption(e.target.value)
                                    }
                                    className="h-8 rounded-md border border-gray-300 bg-gray-50 py-0"
                                >
                                    <option value="name">Name</option>
                                    <option value="artist">Artist</option>
                                    <option value="date">Date</option>
                                </select>
                                {/*sort order*/}
                                <button
                                    onClick={handleSortOrder}
                                    className={`relative -ml-px inline-flex items-center rounded-md text-sm font-medium leading-5 transition duration-150 ease-in-out hover:ring-1 focus:z-10 focus:border-black focus:outline-none focus:ring active:bg-gray-700 active:text-gray-500 ${sortOrder === 'asc' ? 'text-blue-500' : 'text-red-500'}`}
                                >
                                    <svg
                                        className={`h-8 w-8 ${sortOrder === 'asc' ? '-rotate-90' : 'rotate-90'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                            {tracks.map((track: any) => (
                                <SongCard
                                    key={track.id}
                                    image={
                                        API_URL +
                                        '/fetch/img/' +
                                        track.cover_path
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
                        <div className="mt-4 flex justify-center">
                            <a
                                onClick={handlePreviousPage}
                                aria-disabled={currentPage === 1}
                                rel="prev"
                                className="relative inline-flex items-center rounded-l-md border border-gray-50 bg-gray-50 px-2 py-2 text-sm font-medium leading-5 text-red-500 ring-black transition duration-150 ease-in-out focus:z-10 focus:border-black focus:outline-none focus:ring active:bg-gray-700 active:text-gray-500 md:hover:scale-125"
                                aria-label="{{ __('pagination.previous') }}"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </a>
                            <a
                                onClick={handleNextPage}
                                aria-disabled={currentPage === lastPage}
                                rel="next"
                                className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-50 bg-gray-50 px-2 py-2 text-sm font-medium leading-5 text-blue-500 ring-black transition duration-150 ease-in-out focus:z-10 focus:border-black focus:outline-none focus:ring active:bg-gray-700 active:text-gray-500 md:hover:scale-125"
                                aria-label="{{ __('pagination.next') }}"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </a>
                        </div>
                    </div>
                </nav>
            </div>
        </>
    )
}
