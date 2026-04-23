<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Disease extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'latin_name',
        'description',
        'cause',
        'image',
    ];

    public function symptoms(): BelongsToMany
    {
        return $this->belongsToMany(Symptom::class, 'disease_symptom')
            ->withPivot('weight')
            ->withTimestamps();
    }

    public function treatments(): HasMany
    {
        return $this->hasMany(Treatment::class)->orderBy('priority');
    }

    public function detections(): HasMany
    {
        return $this->hasMany(Detection::class);
    }
}
