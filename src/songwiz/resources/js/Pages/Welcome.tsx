import { PageProps } from '@/types'
import { Head, Link } from '@inertiajs/react'
import ImageInput from '@/Components/ImageInput'
import { useState } from 'react'
import AudioInput from '@/Components/AudioInput'
import QueryResultCard from '@/Components/QueryResultCard'
interface TrackData {
    name: string
    artist: string
    cover_path: string
    audio_path: string
    audio_type: string
    score: number
}
export default function Welcome({
    auth,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const handleImageError = () => {
        document
            .getElementById('screenshot-container')
            ?.classList.add('!hidden')
        document.getElementById('docs-card')?.classList.add('!row-span-1')
        document.getElementById('docs-card-content')?.classList.add('!flex-row')
        document.getElementById('background')?.classList.add('!hidden')
    }

    const [activeButton, setActiveButton] = useState(null)
    const [similarTracks, setSimilarTracks] = useState<TrackData[]>([])

    const handleClick = (buttonId: any) => {
        setActiveButton(buttonId)
    }
    return (
        <>
            <Head title="Songwiz" />
            <div className="bg-[url('/images/background.jpeg')] bg-cover">
                <div className="relative flex min-h-screen flex-col items-center justify-center selection:bg-[#FF2D20] selection:text-white">
                    <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                        <header className="grid grid-cols-2 items-center gap-2 lg:grid-cols-3">
                            <div className="flex lg:col-start-2 lg:justify-center">
                                <img
                                    alt="Logo"
                                    src="/images/logo.png"
                                    className="w-4/5"
                                />
                            </div>
                            <nav className="-mx-3 mt-3 flex flex-1 justify-end">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-md px-3 py-2 text-xl font-bold text-black/70 ring-1 ring-transparent transition hover:scale-110 hover:text-red-500 focus:outline-none focus-visible:ring-[#FF2D20]"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-md px-3 py-2 text-xl font-bold text-black/70 ring-1 ring-transparent transition hover:scale-110 hover:text-red-500 focus:outline-none focus-visible:ring-[#FF2D20]"
                                        >
                                            Admin Login
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="hidden rounded-md px-3 py-2 text-xl font-bold text-black/70 ring-1 ring-transparent transition hover:scale-110 hover:text-red-500 focus:outline-none focus-visible:ring-[#FF2D20]"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}

                                <Link
                                    href={route('database')}
                                    className="rounded-md px-10 py-2 text-xl font-bold text-black/70 ring-1 ring-transparent transition hover:scale-110 hover:text-red-500 focus:outline-none focus-visible:ring-[#FF2D20]"
                                >
                                    Database
                                </Link>
                            </nav>
                        </header>

                        <main className="">
                            <div className="mx-auto w-3/4">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="flex w-full flex-row">
                                        <div
                                            onMouseDown={() => handleClick(1)}
                                            className={`box-border flex flex-1 items-center justify-center rounded-t-lg border-2 border-gray-50 ${activeButton === 1 ? 'bg-gray-50' : 'bg-gray-50/50'} cursor-pointer py-3 active:scale-95`}
                                        >
                                            <button
                                                className="text-center"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleClick(1)
                                                }}
                                            >
                                                Audio/MIDI
                                            </button>
                                        </div>
                                        <div
                                            onMouseDown={() => handleClick(2)}
                                            className={`box-border flex flex-1 items-center justify-center rounded-t-lg border-2 border-gray-50 ${activeButton === 2 ? 'bg-gray-50' : 'bg-gray-50/50'} cursor-pointer py-3 active:scale-95`}
                                        >
                                            <button
                                                className="flex-fill"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleClick(2)
                                                }}
                                            >
                                                Image
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex min-h-40 w-full items-center justify-center rounded-b-lg bg-gray-50/50 py-3 text-center">
                                        {activeButton === 1 ? (
                                            <AudioInput
                                                setTrackData={setSimilarTracks}
                                            />
                                        ) : activeButton === 2 ? (
                                            <ImageInput
                                                setTrackData={setSimilarTracks}
                                            />
                                        ) : (
                                            <p className="text-center text-3xl">
                                                Find a{' '}
                                                <span className="font-bold text-[#128bfb]">
                                                    Song
                                                </span>{' '}
                                                by{' '}
                                                <span className="font-semibold">
                                                    Audio/MIDI
                                                </span>{' '}
                                                or
                                                <span className="font-semibold">
                                                    {' '}
                                                    Image
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                    <QueryResultCard
                                        trackData={similarTracks}
                                    />
                                </div>
                            </div>
                        </main>

                        <footer className="/70 py-16 text-center text-sm text-black">
                            <p>
                                Made by{' '}
                                <span className="text-base font-bold underline hover:text-blue-700">
                                    <a
                                        href="https://github.com/kirisame-ame"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        kirisame-ame
                                    </a>
                                </span>
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    )
}
