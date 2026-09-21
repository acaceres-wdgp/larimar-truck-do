<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Truck extends Model
{
    use HasFactory;

    protected $fillable = [
        'plate', 'vin', 'make', 'model', 'year', 'type',
        'capacity_tons', 'odometer_km',
        'status', 'insurance_expires_at', 'inspection_expires_at',
        'notes', 'photo_path',
    ];

    protected $casts = [
        'insurance_expires_at' => 'date',
        'inspection_expires_at' => 'date',
    ];

    public const STATUSES = ['available', 'on_trip', 'in_maintenance', 'out_of_service'];

    public const BODY_TYPES = [
        'Tractor unit', 'Rigid box', 'Flatbed',
        'Chassis (container)', 'Tanker', 'Dump',
    ];

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'available' => 'Available',
            'on_trip' => 'On trip',
            'in_maintenance' => 'In maintenance',
            'out_of_service' => 'Out of service',
            default => $this->status,
        };
    }
}
