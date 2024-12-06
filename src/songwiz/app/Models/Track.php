<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Track extends Model
{
    protected $fillable = [
        'name',
        'cover_path',
        'audio_path',
        'artist',
        'pca_score',
        'atb_score',
        'ftb_score',
        'rtb_score',
        
    ];
}
