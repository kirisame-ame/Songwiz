<?php

namespace App\Http\Controllers;

use App\Models\Track;
use Illuminate\Http\Request;
use Inertia\Response;
use Pgvector\Vector;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class TrackController extends Controller
{
    public function extractMidiFeatures(String $path,String $type):Vector
    {
        if ($type === 'midi' || $type === 'mid') {
            $res = new Vector([1, 2, 3]);

        } else {
            $res = new Vector([0,0,0]);
        }
        return $res;
    }
    public function extractWavFeatures(String $path, String $type):Vector
    {
        if ($type === 'wav' || $type === 'mp3') {
            $res = new Vector([1, 2, 3]);

        } else {
            $res = new Vector([0,0,0]);
        }
        return $res;
    }
    public function extractImageFeatures(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required | file',
        ]);
        $path = $validated['file']->getClientOriginalName();
        $scriptPath = base_path('scripts/image_dataset_processor.py');
        $imageDirPath = public_path('uploads/img');
        $imagePath = $imageDirPath . '/' . $path;
        if (!file_exists($imagePath)) {
            throw new \RuntimeException("Image file does not exist at path: $imagePath");
        }

        $process = new Process(['python', $scriptPath, $imageDirPath, $path]);

        try {
            $process->mustRun();

            $output = $process->getOutput();
            $result = json_decode($output, true, 512, JSON_THROW_ON_ERROR);

            $similarImages = $result['similar_images'];

            $similarImagesMetadata = [];
            foreach ($similarImages as $similarImage) {
                $metadata = Track::where('cover_path', $similarImage)->first();
                if ($metadata) {
                    $similarImagesMetadata[] = [
                        'name' => $metadata->name,
                        'artist' => $metadata->artist,
                        'cover_path' => $metadata->cover_path,
                        'audio_path' => $metadata->audio_path,
                        'audio_type' => $metadata->audio_type,
                    ];
                }
            }
            return response()->json(['similar_images' => $similarImagesMetadata]);
        } catch (ProcessFailedException | \Exception $exception) {
            return response()->json(['error' => $exception->getMessage()]);
        }

    }
    public function index()
    {
        $tracks = Track::all()->latest()->paginate(10);
        return response()->json($tracks);
    }
    public function store(Request $request):void
    {
        $validated = $request->validate([
            'file'=>'required | file',
        ]);
        $file = $validated['file'];
        $jsonData = file_get_contents($file->getRealPath());
        $data = json_decode($jsonData, true, 512, JSON_THROW_ON_ERROR);
        $records = [];
        foreach($data as $track){
            if (!str_contains($track['audio_path'], '-')) {
                [$artist, $name] = ['Unknown', $track['audio_path']];
            }else{
                [$artist, $name] = explode('-', $track['audio_path'], 2);
            }
            $records[] = [
                'name'=>$name,
                'cover_path'=>$track['cover_path'],
                'audio_path'=>$track['audio_path'],
                'audio_type'=>$track['audio_type'],
                'artist'=>$artist,
                'midi_score'=>$this->extractMidiFeatures($track['audio_path'],$track['audio_type']),
                'wav_score'=>$this->extractWavFeatures($track['audio_path'],$track['audio_type']),
            ];
        }
        Track::insert($records);

    }
}
