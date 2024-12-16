<?php

namespace App\Http\Controllers;

use App\Models\Track;
use Illuminate\Http\Request;
use Inertia\Response;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class TrackController extends Controller
{
    public function extractMidiFeatures(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required | file|mimes:mid',
        ]);
        copy($validated['file']->getRealPath(), public_path('temp/') . $validated['file']->getClientOriginalName());
        $scriptPath = base_path('scripts/midi_query.py');
        $midiDirPath = public_path('uploads/midi');
        $midiPath = public_path('temp/') . $validated['file']->getClientOriginalName();
        $cache_path = public_path('midi_cache');
        if (!file_exists($midiPath)) {
            throw new \RuntimeException("Midi file does not exist at path: $midiPath");
        }
        $process = new Process(['python', $scriptPath, $midiDirPath, $cache_path, $midiPath]);
        try {
            $process->mustRun();
            $output = $process->getOutput();
            $result = json_decode($output, true, 512, JSON_THROW_ON_ERROR);
            $similarMidiData = [];
            foreach($result as $key=>$value){
                $metadata = Track::where('audio_path', $key)->first();
                if ($metadata) {
                    $similarMidiData[] = [
                        'name' => $metadata->name,
                        'artist' => $metadata->artist,
                        'cover_path' => $metadata->cover_path,
                        'audio_path' => $metadata->audio_path,
                        'audio_type' => $metadata->audio_type,
                        'score' => $value
                    ];
                }
            }
            if (file_exists($midiPath)) {
                unlink($midiPath);
            }
            return response()->json(['similar_midi' => $similarMidiData]);
        } catch (ProcessFailedException|\Exception $exception) {
            if (file_exists($midiPath)) {
                unlink($midiPath);
            }
            return response()->json(['error' => $exception->getMessage()]);
        }
    }
    public function extractAudioFeatures(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required | file',
        ]);
        copy($validated['file']->getRealPath(), public_path('temp/') . $validated['file']->getClientOriginalName());
        $scriptPath = base_path('scripts/midi_query.py');
        $midiDirPath = public_path('uploads/midi');
        $midiPath = public_path('temp/') . $validated['file']->getClientOriginalName();
        $cache_path = public_path('midi_cache');
        if (!file_exists($midiPath)) {
            throw new \RuntimeException("Midi file does not exist at path: $midiPath");
        }
        $process = new Process(['python', $scriptPath, $midiDirPath, $cache_path, $midiPath]);
        try {
            $process->mustRun();
            $output = $process->getOutput();
            $result = json_decode($output, true, 512, JSON_THROW_ON_ERROR);
            $similarMidiData = [];
            foreach($result as $key=>$value){
                $metadata = Track::where('audio_path', $key)->first();
                if ($metadata) {
                    $similarMidiData[] = [
                        'name' => $metadata->name,
                        'artist' => $metadata->artist,
                        'cover_path' => $metadata->cover_path,
                        'audio_path' => $metadata->audio_path,
                        'audio_type' => $metadata->audio_type,
                        'score' => $value
                    ];
                }
            }
            if (file_exists($midiPath)) {
                unlink($midiPath);
            }
            return response()->json(['similar_midi' => $similarMidiData]);
        } catch (ProcessFailedException|\Exception $exception) {
            if (file_exists($midiPath)) {
                unlink($midiPath);
            }
            return response()->json(['error' => $exception->getMessage()]);
        }
    }
    public function extractImageFeatures(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required | file',
        ]);
        copy($validated['file']->getRealPath(), public_path('temp/').$validated['file']->getClientOriginalName());
        $scriptPath = base_path('scripts/image_dataset_processor.py');
        $imageDirPath = public_path('uploads/img');
        $imagePath = public_path('temp/') . $validated['file']->getClientOriginalName();
        if (!file_exists($imagePath)) {
            throw new \RuntimeException("Image file does not exist at path: $imagePath");
        }

        $process = new Process(['python', $scriptPath, $imageDirPath, $imagePath]);

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
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
            return response()->json(['similar_images' => $similarImagesMetadata]);
        } catch (ProcessFailedException | \Exception $exception) {
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
            return response()->json(['error' => $exception->getMessage()]);
        }


    }
    public function index()
    {
        try {
            $tracks = Track::latest()->paginate(8);
            return response()->json($tracks);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
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
            if (str_contains($track['audio_path'], '-')) {
                [$artist, $name] = explode('-', $track['audio_path'], 2);
            }else if (str_contains($track['audio_path'], '/')) {
                [$artist, $name] = explode('/', $track['audio_path'], 2);
            }else if (str_contains($track['audio_path'], '⧸')) {
                [$artist, $name] = explode('⧸', $track['audio_path'], 2);
            }
            else if (str_contains($track['audio_path'], '「')) {
                $cleaned = str_replace('」', '', $track['audio_path']);
                [$artist, $name] = explode('「', $cleaned, 2);
            }else if (str_contains($track['audio_path'], '『')) {
                $cleaned = str_replace('』', '', $track['audio_path']);
                [$artist, $name] = explode('『', $cleaned, 2);
            }else{
                $artist = 'Unknown';
                $name = $track['audio_path'];
            }
            dump($track['cover_path']);
            $records[] = [
                'name'=>$name,
                'cover_path'=>$track['cover_path'],
                'audio_path'=>$track['audio_path'],
                'audio_type'=>$track['audio_type'],
                'artist'=>$artist,
            ];
        }
        Track::insert($records);

    }
}
