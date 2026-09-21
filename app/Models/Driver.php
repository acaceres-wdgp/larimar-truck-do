<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name', 'last_name', 'national_id', 'phone', 'emergency_contact',
        'license_number', 'license_category', 'license_expires_at',
        'status', 'notes', 'photo_path',
        'pay_type', 'pay_rate', 'bank_account',
    ];

    protected $casts = [
        'license_expires_at' => 'date',
    ];

    public const STATUSES = ['available', 'on_trip', 'on_leave', 'inactive'];

    public const LICENSE_CATEGORIES = [
        'Category 04 (heavy)',
        'Category 05 (articulated)',
        'Category 03 (light truck)',
        'Hazmat endorsement',
    ];

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function payrollItems(): HasMany
    {
        return $this->hasMany(PayrollItem::class);
    }
}
