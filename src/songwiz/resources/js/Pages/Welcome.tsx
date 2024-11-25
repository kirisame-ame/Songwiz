import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const handleImageError = () => {
        document
            .getElementById('screenshot-container')
            ?.classList.add('!hidden');
        document.getElementById('docs-card')?.classList.add('!row-span-1');
        document
            .getElementById('docs-card-content')
            ?.classList.add('!flex-row');
        document.getElementById('background')?.classList.add('!hidden');
    };

    return (
        <>
            <Head title="Songwiz" />
            <div className="bg-cover bg-[url('/images/background.jpeg')]">
                <div className="relative flex min-h-screen flex-col items-center justify-center selection:bg-[#FF2D20] selection:text-white">
                    <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                        <header className="grid grid-cols-2 items-center gap-2  lg:grid-cols-3">
                            <div className="flex lg:col-start-2 lg:justify-center">
                                <img alt="Logo" src="/images/logo.png" className="w-4/5 "/>
                            </div>
                            <nav className="-mx-3 mt-3 flex flex-1 justify-end">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20]"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="text-xl font-bold rounded-md px-3 py-2 text-black/70 ring-1 ring-transparent transition hover:text-red-500 hover:scale-110 focus:outline-none focus-visible:ring-[#FF2D20]"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="text-xl font-bold rounded-md px-3 py-2 text-black/70 ring-1 ring-transparent transition hover:text-blue-500/70 hover:scale-110 focus:outline-none focus-visible:ring-[#FF2D20]"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </header>

                        <main className="">
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-3/4 flex flex-row">
                                    <div className="items-center justify-center flex flex-1 bg-gray-50/50 rounded-t-lg py-3 border-2 border-gray-50">
                                        <button className="text-center">
                                            Audio
                                        </button>
                                    </div>
                                    <div className="items-center justify-center flex flex-1 bg-gray-50/50 rounded-t-lg py-3 border-2 border-gray-50">
                                        <button className="text-center">
                                            Image
                                        </button>
                                    </div>
                                </div>
                                <div className="w-3/4 text-center bg-gray-50/50 text-3xl font-bold text-black/70">
                                    File input Box
                                </div>
                                <div></div>
                            </div>
                        </main>

                        <footer className="py-16 text-center text-sm text-black /70">
                            Made by kirisame-ame
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
