<?php

namespace App\Http\Controllers;

use App\Models\Track;
use Illuminate\Http\Request;
use ZipArchive;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;


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
    public function cache(Request $request){
        $midi_dir = public_path('uploads/midi');
        $cache_dir = public_path('midi_cache');
        $scriptPath = base_path('scripts/midi_driver.py');
        $audio_dir = public_path('uploads/audio');
        $audioScript = base_path('scripts/audio_cache.py');
        $audioCacheDir = public_path('audio_cache');
        $process = new Process(['python3', $scriptPath, $midi_dir, $cache_dir]);
        $process2 = new Process(['python3', $audioScript, $audio_dir, $audioCacheDir]);
        try{
            $process->mustRun();
            $process2->mustRun();
            dump($process2->getOutput());
            dump($process2->getErrorOutput());
            return response()->json(['message' => 'files cached successfully'], 200);
        } catch (ProcessFailedException $exception) {
            return response()->json(['message' => 'Failed to cache MIDI files', 'error' => $exception->getMessage()], 500);
        }

    }
}
