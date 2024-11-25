import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import ImageInput from "@/Components/ImageInput";
import {useState} from "react";

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
                                            className="text-xl font-bold rounded-md px-3 py-2 text-black/70 ring-1 ring-transparent transition hover:text-red-500 hover:scale-110 focus:outline-none focus-visible:ring-[#FF2D20]"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </header>

                        <main className="">
                            <div className="w-3/4 mx-auto">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="flex flex-row w-full">
                                        <div
                                            className="items-center justify-center flex flex-1 rounded-t-lg py-3 border-2 border-gray-50 bg-gray-50/50 active:scale-95">
                                            <button className="text-center">
                                                Audio
                                            </button>
                                        </div>
                                        <div
                                            className="items-center justify-center flex flex-1 rounded-t-lg py-3 border-2 border-gray-50 bg-gray-50/50 active:scale-95">
                                            <button className="text-center">
                                                Image
                                            </button>
                                        </div>
                                    </div>
                                    <div className="w-full min-h-40 bg-gray-50/50 items-center justify-center flex text-center py-3">
                                        <ImageInput></ImageInput>
                                    </div>
                                </div>
                            </div>

                        </main>

                        <footer className="py-16 text-center text-sm text-black /70">
                            <p>Made by <span className="text-base font-bold underline hover:text-blue-700"><a href="https://github.com/kirisame-ame" target="_blank" rel="noopener noreferrer">kirisame-ame</a></span></p>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
