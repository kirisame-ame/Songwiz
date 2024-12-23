import React, { useEffect, useRef } from 'react'
import Dropzone from 'dropzone'
import 'dropzone/dist/dropzone.css'

const API_URL = 'http://noogs4okgk04gww40g8g0sw0.140.245.62.251.sslip.io'
const FileUploader = () => {
    const dropzoneRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        // Configure Dropzone
        const dz = new Dropzone(dropzoneRef.current!, {
            url: API_URL + '/upload', // Your Flask endpoint
            paramName: 'file',
            chunking: true,
            forceChunking: true,
            maxFilesize: 10250, // in MB
            chunkSize: 1000000, // in bytes (1 MB chunks)
        })

        // Cleanup Dropzone instance on component unmount
        return () => {
            dz.destroy()
        }
    }, [])

    return <form ref={dropzoneRef} className="dropzone dz-clickable" />
}

export default FileUploader
