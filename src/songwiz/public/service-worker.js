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
            return await fetch(request.url, {
                method: 'POST',
                body: formData,
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
