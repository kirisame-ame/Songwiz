<?php

namespace App\Http\Controllers;

use App\Models\Track;
use Illuminate\Http\Request;
use ZipArchive;

class ZipUploadController extends Controller
{
    public function upload(Request $request)
    {
        if ($request->hasFile('file')) {
            $zipFile = $request->file('file');

            $destinationPath = public_path('uploads');

            $zip = new ZipArchive;

            if ($zip->open($zipFile->getRealPath()) === TRUE) {
                $allowedExtensions = ['mid', 'midi', 'wav', 'mp3', 'jpg', 'png', 'webp'];

                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $fileName = $zip->getNameIndex($i); // Full path of the file
                    $fileInfo = pathinfo($fileName);

                    if (!empty($fileInfo['extension']) && in_array(strtolower($fileInfo['extension']), $allowedExtensions)) {
                        $cleanFileName = $fileInfo['basename'];
                        $targetDir = match (strtolower($fileInfo['extension'])) {
                            'mid', 'midi' => $destinationPath . '/midi/',
                            'wav', 'mp3' => $destinationPath . '/audio/',
                            'jpg', 'png', 'webp' => $destinationPath . '/img/',
                            default => $destinationPath . '/others/',
                        };
                        // Extract the file to the target directory
                        copy('zip://' . $zipFile->getRealPath() . '#' . $fileName, $targetDir . $cleanFileName);

                    }
                }

                $zip->close();

                return response()->json([
                    'message' => 'ZIP file uploaded and extracted successfully',
                    'files' => [
                        'midi' => scandir($destinationPath . '/midi') ?: [],
                        'audio' => scandir($destinationPath . '/audio') ?: [],
                        'img' => scandir($destinationPath . '/img') ?: [],
                    ],
                ], 200);
            }

            return response()->json(['message' => 'Failed to open the ZIP file'], 500);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }
}
