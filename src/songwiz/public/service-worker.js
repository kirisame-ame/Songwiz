let csrfToken = null // Variable to store the token

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data.csrfToken) {
        csrfToken = event.data.csrfToken
        console.log('CSRF token received in Service Worker:', csrfToken)
    }
})

self.addEventListener('install', (event) => {
    console.log('Service Worker installed')
})

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url)

    if (url.pathname === '/upload') {
        event.respondWith(handleFileUpload(event.request))
    }
})

async function handleFileUpload(request) {
    try {
        const requestClone = request.clone()
        const formData = await requestClone.formData()

        const file = formData.get('file')
        if (file) {
            if (!csrfToken) {
                return new Response(
                    JSON.stringify({ error: 'No CSRF token found' }),
                    {
                        status: 400,
                    }
                )
            }
            formData.append('_token', csrfToken)
            return await fetch(request.url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                },
            })
        }

        return new Response(JSON.stringify({ error: 'No file found' }), {
            status: 400,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        })
    }
}
