<?php

namespace App\Http\Controllers;

use App\Models\Track;
use Illuminate\Http\Request;
use Pgvector\Vector;

class TrackController extends Controller
{
    public function extractMidiFeatures():Vector
    {
        return $res;
    }
    public function extractWavFeatures():Vector
    {

    }
    public function extractImageFeatures():Vector{

    }
    public function index()
    {
        $tracks = Track::all()->latest()->paginate(10);
    }
    public function store(string $name,string $cover_path,string $audio_path,string $audio_type,string $artist)
    {

        $pcaScore = $this->extractImageFeatures();
        if ($audio_type === 'midi' || $audio_type === 'mid') {
            $midiScore = $this->extractMidiFeatures();
            $wavScore = null;
        } else if($audio_type === 'wav' || $audio_type === 'mp3') {
            $midiScore = null;
            $wavScore = $this->extractWavFeatures();
        }
        $this->extractAudioFeatures();
        Track::create([
            'name' => $name,
            'cover_path' => $cover_path,
            'audio_path' => $audio_path,
            'audio_type' => $audio_type,
            'artist' => $artist,
            'pca_score' => $pcaScore,
            'midi_score' => $midiScore,
            'wav_score' => $wavScore,
        ]);
    }
}
