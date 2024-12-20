import React, { useState } from 'react'
// @ts-ignore
import { FilePond, File, registerPlugin } from 'react-filepond'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
registerPlugin(FilePondPluginFileValidateType)
import 'filepond/dist/filepond.min.css'

const API_URL = 'http://noogs4okgk04gww40g8g0sw0.140.245.62.251.sslip.io'

export const FileUploader = () => {
    const [files, setFiles] = useState<File[]>([])

    // @ts-ignore
    // @ts-ignore
    return (
        <div className="w-50">
            <FilePond
                files={files}
                onupdatefiles={setFiles}
                allowMultiple={false}
                dropOnPage
                server={{
                    process: {
                        url: `${API_URL}/upload`, // Endpoint to create a transfer ID
                        method: 'POST',
                        onload: (response) => {
                            // Ensure the response is parsed correctly and UUID is returned
                            const { id } = JSON.parse(response)
                            return id // FilePond associates this ID with the file
                        },
                        onerror: (error) => {
                            console.error(
                                'Error during upload initialization',
                                error
                            )
                        },
                    },
                    patch: {
                        url: (transferId: any) =>
                            `${API_URL}/upload/${transferId}`, // Use the transfer ID for chunk uploads
                        method: 'PATCH',
                    },
                    revert: {
                        url: (transferId: any) =>
                            `${API_URL}/upload/${transferId}`, // Use the transfer ID for cancelation
                        method: 'DELETE',
                    }, // Optional: Add endpoint to handle file removal if necessary
                }}
                name="file"
                dropValidation
                acceptedFileTypes={[
                    'application/zip',
                    'application/x-zip-compressed',
                ]}
                chunkUploads
                chunkForce={true} // Force chunk uploads even for small files
                chunkSize={10 * 1024 * 1024} // 10 MB chunks
                chunkRetryDelays={[500, 1000, 3000]} // Retry delays for failed chunks
            />
        </div>
    )
}
