import React, { useState } from 'react'
// @ts-ignore
import { FilePond, File, registerPlugin } from 'react-filepond'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
registerPlugin(FilePondPluginFileValidateType)
import 'filepond/dist/filepond.min.css'
const API_URL = 'http://noogs4okgk04gww40g8g0sw0.140.245.62.251.sslip.io'
interface FileUploaderProps {
    fileTypes: string[]
}
export const FileUploader = (props: FileUploaderProps) => {
    const [files, setFiles] = useState<File[]>([])

    return (
        <div>
            <FilePond
                files={files}
                onupdatefiles={setFiles}
                allowMultiple={false}
                dropOnPage
                server={API_URL + '/upload'}
                name="files"
                dropValidation
                acceptedFileTypes={props.fileTypes}
            />
        </div>
    )
}
