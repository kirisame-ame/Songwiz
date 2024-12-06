import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react'
import AudioInput from '@/Components/AudioInput'

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
                    <div className="flex flex-col overflow-hidden">
                        <div className="p-6 text-lg text-black/70">
                            Upload Datasets
                        </div>
                        <div className="p-6 text-lg text-black/70">
                            Upload Mapper Files
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
