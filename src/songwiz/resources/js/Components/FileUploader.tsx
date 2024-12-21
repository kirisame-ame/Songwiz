import { useState, useEffect, DragEvent } from 'react'
import axios from 'axios'
import './App.css'

const chunkSize = 10 * 1024 * 1024
const API_URL = 'http://noogs4okgk04gww40g8g0sw0.140.245.62.251.sslip.io'
function FileUploader() {
    const [dropzoneActive, setDropzoneActive] = useState(false)
    const [files, setFiles] = useState([])
    const [currentFileIndex, setCurrentFileIndex] = useState(null)
    const [lastUploadedFileIndex, setLastUploadedFileIndex] = useState(null)
    const [currentChunkIndex, setCurrentChunkIndex] = useState(null)

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault()
        // @ts-ignore
        setFiles([...files, ...e.dataTransfer.files])
    }

    function readAndUploadCurrentChunk() {
        const reader = new FileReader()
        if (currentFileIndex === null) {
            // @ts-ignore
            setCurrentChunkIndex(0)
        }
        // @ts-ignore
        const file = files[currentFileIndex]
        if (!file) {
            return
        }
        // @ts-ignore
        const from = currentChunkIndex * chunkSize
        const to = from + chunkSize
        const blob = file.slice(from, to)
        reader.onload = (e) => uploadChunk(e)
        reader.readAsDataURL(blob)
    }

    function uploadChunk(readerEvent: ProgressEvent<FileReader>) {
        // @ts-ignore
        const file = files[currentFileIndex]
        // @ts-ignore
        const data = readerEvent.target.result
        const params = new URLSearchParams()
        params.set('name', file.name)
        params.set('size', file.size)
        // @ts-ignore
        params.set('currentChunkIndex', currentChunkIndex)
        params.set('totalChunks', String(Math.ceil(file.size / chunkSize)))
        const headers = { 'Content-Type': 'application/octet-stream' }
        const url = API_URL + '/upload?' + params.toString()
        axios.post(url, data, { headers }).then((response) => {
            // @ts-ignore
            const file = files[currentFileIndex]
            // @ts-ignore
            const filesize = files[currentFileIndex].size
            const chunks = Math.ceil(filesize / chunkSize) - 1
            const isLastChunk = currentChunkIndex === chunks
            if (isLastChunk) {
                file.finalFilename = response.data.finalFilename
                setLastUploadedFileIndex(currentFileIndex)
                setCurrentChunkIndex(null)
            } else {
                // @ts-ignore
                setCurrentChunkIndex(currentChunkIndex + 1)
            }
        })
    }

    useEffect(() => {
        if (lastUploadedFileIndex === null) {
            return
        }
        const isLastFile = lastUploadedFileIndex === files.length - 1
        // @ts-ignore
        const nextFileIndex = isLastFile ? null : currentFileIndex + 1
        setCurrentFileIndex(nextFileIndex)
    }, [lastUploadedFileIndex])

    useEffect(() => {
        if (files.length > 0) {
            if (currentFileIndex === null) {
                setCurrentFileIndex(
                    // @ts-ignore
                    lastUploadedFileIndex === null
                        ? 0
                        : lastUploadedFileIndex + 1
                )
            }
        }
    }, [files.length])

    useEffect(() => {
        if (currentFileIndex !== null) {
            // @ts-ignore
            setCurrentChunkIndex(0)
        }
    }, [currentFileIndex])

    useEffect(() => {
        if (currentChunkIndex !== null) {
            readAndUploadCurrentChunk()
        }
    }, [currentChunkIndex])

    return (
        <div>
            <div
                onDragOver={(e) => {
                    setDropzoneActive(true)
                    e.preventDefault()
                }}
                onDragLeave={(e) => {
                    setDropzoneActive(false)
                    e.preventDefault()
                }}
                onDrop={(e) => handleDrop(e)}
                className={'dropzone' + (dropzoneActive ? ' active' : '')}
            >
                Drop your files here
            </div>
            <div className="files">
                {files.map((file, fileIndex) => {
                    let progress = 0
                    // @ts-ignore

                    if (file.finalFilename) {
                        progress = 100
                    } else {
                        const uploading = fileIndex === currentFileIndex
                        // @ts-ignore
                        const chunks = Math.ceil(file.size / chunkSize)
                        if (uploading) {
                            progress = Math.round(
                                // @ts-ignore

                                (currentChunkIndex / chunks) * 100
                            )
                        } else {
                            progress = 0
                        }
                    }
                    // @ts-ignore
                    return (
                        <a
                            className="file"
                            target="_blank"
                            href={
                                API_URL +
                                '/uploads/' +
                                // @ts-ignore

                                file.finalFilename
                            }
                        >
                            <div className="name">File</div>
                            <div
                                className={
                                    'progress ' +
                                    (progress === 100 ? 'done' : '')
                                }
                                style={{ width: progress + '%' }}
                            >
                                {progress}%
                            </div>
                        </a>
                    )
                })}
            </div>
        </div>
    )
}

export default FileUploader
