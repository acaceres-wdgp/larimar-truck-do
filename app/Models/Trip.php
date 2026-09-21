<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Trip extends Model
{
    use HasFactory;

    public const STATUSES = ['Scheduled', 'At port', 'On the road', 'Paused', 'Delayed', 'Completed', 'Cancelled'];

    protected $fillable = [
        'date', 'type', 'client', 'client_id', 'line', 'from_location', 'to_location',
        'truck_id', 'driver_id', 'status', 'km',
        'order_number', 'shipping_line_id', 'origin_type', 'origin_id',
        'destination_type', 'destination_id', 'container_number', 'container_size',
        'cargo_type', 'weight_tons', 'rate', 'fuel_cost', 'toll_cost', 'driver_pay',
        'payroll_item_id',
    ];

    protected $casts = [
        'date' => 'date',
        'km' => 'decimal:1',
    ];

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function clientModel(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function shippingLine(): BelongsTo
    {
        return $this->belongsTo(ShippingLine::class);
    }

    public function order(): HasOne
    {
        return $this->hasOne(Order::class);
    }

    public function payrollItem(): BelongsTo
    {
        return $this->belongsTo(PayrollItem::class);
    }

    public function getMarginAttribute(): float
    {
        return ($this->rate ?? 0) - (($this->fuel_cost ?? 0) + ($this->toll_cost ?? 0) + ($this->driver_pay ?? 0));
    }
}
