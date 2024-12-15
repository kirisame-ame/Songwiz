import React, { useState } from 'react'
import axios from 'axios'

function MapperUpload() {
    const [fileName, setFileName] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const handleFileChange = (event: any) => {
        const file = event.target.files[0]
        if (file) {
            setFile(file)
            setFileName(file.name)
        }
    }
    const handleButtonClick = () => {
        document.getElementById('hidden-mapper-input')?.click()
    }
    const handleLoadMapper = async () => {
        if (file) {
            const formData = new FormData()
            formData.append('file', file)

            try {
                await axios.post('/upload-json', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                console.log('Upload complete')
            } catch (err) {
                console.error('Upload failed', err)
            }
        }
    }
    return (
        <div className="flex flex-row items-center gap-x-10">
            <input
                id="hidden-mapper-input"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            {fileName && <p>Selected File: {fileName}</p>}

            <button onClick={handleButtonClick}>
                {fileName ? 'Change Mapper File' : 'Upload Mapper File'}
            </button>
            <button
                onClick={handleLoadMapper}
                className={fileName ? 'block' : 'hidden'}
            >
                Load Mapper
            </button>
        </div>
    )
}

export default MapperUpload
