import ApplicationLogo from '@/Components/ApplicationLogo'
import { Link } from '@inertiajs/react'
import { PropsWithChildren } from 'react'

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[url('/images/background.jpeg')] bg-cover pt-6 sm:justify-center sm:pt-0">
            <div className="flex items-center justify-center">
                <Link href="/" className="flex w-4/5 justify-center">
                    <img alt="Logo" src="/images/logo.png" className="w-4/5" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-gray-50/50 px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    )
}
