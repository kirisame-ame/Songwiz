<?php

namespace App\Http\Controllers;

use App\Models\Track;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;
use GuzzleHttp\Client;

class TrackController extends Controller
{
    public function extractMidiFeatures(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required | file',
        ]);
        $client = new Client();
        $response = $client->post(env('API_URL').'/midi-query', [
            'multipart' => [
                [
                    'name' => 'file',
                    'contents' => fopen($validated['file']->getRealPath(), 'rb'),
                    'filename' => $validated['file']->getClientOriginalName(),
                    'headers' => [
                        'Content-Type' => $validated['file']->getMimeType() // Set MIME type explicitly
                    ]
                ]
            ]
        ]);
        if ($response->getStatusCode() === 200) {
            $output = $response->getBody()->getContents();
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
            return response()->json(['similar_midi' => $similarMidiData]);
        }
        return response()->json(['error' => 'Failed to extract midi features']);
    }
    public function extractAudioFeatures(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required | file',
        ]);
        $client = new Client();
        $response = $client->post(env('API_URL').'/audio-query', [
            'multipart' => [
                [
                    'name' => 'file',
                    'contents' => fopen($validated['file']->getRealPath(), 'rb'),
                    'filename' => $validated['file']->getClientOriginalName(),
                    'headers' => [
                        'Content-Type' => $validated['file']->getMimeType() // Set MIME type explicitly
                    ]
                ]
            ]
        ]);
        if ($response->getStatusCode() === 200) {
            $output = $response->getBody()->getContents();
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
            return response()->json(['similar_audio' => $similarMidiData]);
        }
        return \response()->json(['error' => 'Failed to extract audio features']);
    }
    public function extractImageFeatures(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file',
        ]);
        $client = new Client();
        $response = $client->post(env('API_URL').'/image-query', [
            'multipart' => [
                [
                    'name' => 'file',
                    'contents' => fopen($validated['file']->getRealPath(), 'rb'),
                    'filename' => $validated['file']->getClientOriginalName(),
                    'headers' => [
                        'Content-Type' => $validated['file']->getMimeType() // Set MIME type explicitly
                    ]
                ]
            ]
        ]);
        if ($response->getStatusCode() === 200) {
            $output = $response->getBody()->getContents();
            $result = json_decode($output, true, 512, JSON_THROW_ON_ERROR);
            $similarImages = json_decode($result['similar_images'], true, 512, JSON_THROW_ON_ERROR);
            $similarImagesMetadata = [];
            foreach ($similarImages as $similarImage) {
                foreach ($similarImage as $image) {
                    $metadata = Track::where('cover_path', $image['filename'])->first();
                    if ($metadata) {
                        $similarImagesMetadata[] = [
                            'name' => $metadata->name,
                            'artist' => $metadata->artist,
                            'cover_path' => $metadata->cover_path,
                            'audio_path' => $metadata->audio_path,
                            'audio_type' => $metadata->audio_type,
                            'score' => $image['similarity']
                        ];
                    }
                }
            }
            return response()->json(['similar_images' => $similarImagesMetadata]);
        }

        return response()->json(['error' => 'Failed to extract image features']);
    }
    public function index(Request $request)
    {
        $sorter = $request->input('sort');
        try {
            $tracks = Track::orderBy($sorter)->paginate(8);
            return response()->json($tracks);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function search(Request $request)
    {
        $query = $request->input('query');

        // Perform the fuzzy search, ordering by similarity
        $tracks = Track::select('*')
            ->where('audio_path', 'ILIKE', "%$query%")
            ->orderByRaw("similarity(audio_path, ?) DESC", [$query])
            ->paginate(8);
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
            if (Track::where('audio_path', $track['audio_path'])->exists()) {
                continue;
            }
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
    public function download(){
        $mapper = DB::table('tracks')->select('name','artist','cover_path','audio_path','audio_type')->get();
        $json = json_encode($mapper, JSON_PRETTY_PRINT);
        $filename = 'mapper.json';
        $headers = [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];
        return response($json, 200, $headers);
    }
}
