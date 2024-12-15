import { Link } from '@inertiajs/react'
import NavLink from '@/Components/NavLink'
import SongCard from '@/Components/SongCard'

// unauthenticated user can access this page
const songs = [
    {
        image: '../../uploads/img/835226.jpg',
        title: 'Song 1',
        onPlay: () => console.log('Playing Song 1'),
    },
    {
        image: '../../uploads/img/arona_bg.jpg',
        title: 'Song 2',
        onPlay: () => console.log('Playing Song 2'),
    },
]

export default function Database() {
    return (
        <div className="min-h-screen bg-[url('/images/background.jpeg')] bg-cover pt-3 text-black/70">
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
                        {songs.map((song, index) => (
                            <SongCard key={index} {...song} />
                        ))}
                    </div>
                </div>
            </nav>
        </div>
    )
}
