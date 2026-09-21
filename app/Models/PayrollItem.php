<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollItem extends Model
{
    protected $fillable = [
        'payroll_run_id', 'driver_id', 'driver_name',
        'trips_count', 'gross_pay', 'deductions', 'net_pay',
        'status', 'paid_at', 'notes',
    ];

    protected $casts = [
        'gross_pay'  => 'decimal:2',
        'deductions' => 'decimal:2',
        'net_pay'    => 'decimal:2',
        'paid_at'    => 'datetime',
    ];

    public function run(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class, 'payroll_run_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function trips(): HasMany
    {
        return $this->hasMany(Trip::class);
    }
}
