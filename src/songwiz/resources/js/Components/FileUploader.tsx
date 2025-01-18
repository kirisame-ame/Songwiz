import React, { useEffect, useRef } from 'react'
import Dropzone from 'dropzone'
import 'dropzone/dist/dropzone.css'

const API_URL = import.meta.env.VITE_API_URL
const FileUploader = () => {
    const dropzoneRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        const dz = new Dropzone(dropzoneRef.current!, {
            url: API_URL + '/upload',
            paramName: 'file',
            chunking: true,
            forceChunking: true,
            maxFilesize: 10250,
            chunkSize: 1000000,
        })

        return () => {
            dz.destroy()
        }
    }, [])

    return <form ref={dropzoneRef} className="dropzone dz-clickable" />
}

export default FileUploader
