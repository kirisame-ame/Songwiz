import '../css/app.css'
import './bootstrap'

import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { createRoot } from 'react-dom/client'

createInertiaApp({
    title: (title) => `${title}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx')
        ),
    setup({ el, App, props }) {
        const root = createRoot(el)

        root.render(<App {...props} />)
    },
    progress: {
        color: '#4B5563',
    },
})
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content')
            if (csrfToken) {
                if (registration.active) {
                    registration.active.postMessage({ csrfToken })
                }
            }
            console.log('Service Worker registered:', registration)
        })
}
