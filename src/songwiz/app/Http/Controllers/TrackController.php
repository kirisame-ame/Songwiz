<?php

namespace App\Http\Controllers;

use App\Models\Track;
use Illuminate\Http\Request;
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
            $res = null;
        }
        return $res;
    }
    public function extractWavFeatures(String $path, String $type):Vector
    {
        if ($type === 'wav' || $type === 'mp3') {
            $res = new Vector([1, 2, 3]);

        } else {
            $res = null;
        }
        return $res;
    }
    public function extractImageFeatures(String $path, ): ?array
    {
        $scriptPath = base_path('scripts/extract_image_features.py');
        $imagePath = public_path('uploads/img/' . $path);
        if (!file_exists($imagePath)) {
            throw new \RuntimeException("Image file does not exist at path: $imagePath");
        }

        $process = new Process(['python', $scriptPath, $imagePath, $imageAvg]);

        try {
            $process->mustRun();

            $output = json_decode($process->getOutput(), true);

            if (!is_array($output)) {
                throw new \RuntimeException("Invalid output from Python script");
            }

            return $output;
        } catch (ProcessFailedException | \Exception $exception) {
            throw new \RuntimeException("Failed to extract image features: " . $exception->getMessage());
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
            'data'=>'required | json',
        ]);
        $data = json_decode($validated['data'], true, 512, JSON_THROW_ON_ERROR);
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
