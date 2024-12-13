import React, { useState } from 'react'

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
    const handleLoadMapper = () => {
        if (file) {
            console.log('Load Mapper:', file)
        }
    }
    return (
        <div className="flex flex-col">
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
                Load Dataset
            </button>
        </div>
    )
}

export default MapperUpload
