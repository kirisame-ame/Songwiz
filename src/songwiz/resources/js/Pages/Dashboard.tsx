import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react'
import DatasetLoader from '@/Components/DatasetLoader'
import MapperUpload from '@/Components/MapperUpload'

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-black/70">
                    Admin Page
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="">
                <div className="mx-auto max-w-7xl rounded-lg border-2 border-gray-50 bg-gray-50/50 sm:px-6 lg:px-8">
                    <div className="flex flex-row justify-around">
                        <div className="px-auto flex flex-col justify-center p-6 text-black/70">
                            <h1 className="text-3xl font-bold">
                                Manage Dataset
                            </h1>
                            <div className="flex flex-row justify-center">
                                <DatasetLoader />
                            </div>
                        </div>

                        <div className="px-auto p-6 text-black/70">
                            <h1 className="text-3xl font-bold">
                                Manage Mapper
                            </h1>
                            <div className="flex flex-row justify-center">
                                <MapperUpload />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
        </AuthenticatedLayout>
    )
}
