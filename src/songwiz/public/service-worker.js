self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Intercept file uploads
    if (url.pathname === '/upload') {
        event.respondWith(handleFileUpload(event.request));
    }
});

async function handleFileUpload(request) {
    try {
        // Clone the request since the body can only be read once
        const requestClone = request.clone();
        const formData = await requestClone.formData();

        // Get the file from the form data
        const file = formData.get('file');
        if (file) {
            // Perform the upload
            return await fetch(request.url, {
                method: 'POST',
                body: formData,
            })
        }

        return new Response(JSON.stringify({ error: 'No file found' }), {
            status: 400,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}
