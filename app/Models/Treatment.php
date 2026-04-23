<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Treatment extends Model
{
    use HasFactory;

    protected $fillable = [
        'disease_id',
        'type',
        'description',
        'dosage',
        'dosage_unit',
        'priority',
    ];

    public function disease(): BelongsTo
    {
        return $this->belongsTo(Disease::class);
    }
}
