<?php

namespace App\Models;

use Pgvector\Laravel\HasNeighbors;
use Pgvector\Laravel\Vector;
use Illuminate\Database\Eloquent\Model;

class Track extends Model
{
    use HasNeighbors;
    protected $fillable = [
        'name',
        'cover_path',
        'audio_path',
        'audio_type',
        'artist',
        'pca_score',
        'midi_score',
        'wav_score',
    ];
    protected $casts = [
        'pca_score' => Vector::class,
        'midi_score' => Vector::class,
        'wav_score' => Vector::class,
    ];
}
