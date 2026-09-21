<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShippingLine extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'scac', 'contact', 'active'];

    protected $casts = ['active' => 'boolean'];

    public function trips(): HasMany
    {
        return $this->hasMany(Trip::class);
    }
}
