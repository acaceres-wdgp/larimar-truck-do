<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    use HasFactory;

    public const STATUSES = ['open', 'ready', 'invoiced', 'cancelled'];

    protected $fillable = ['trip_id', 'client_id', 'client', 'date', 'status', 'completed_at', 'invoiced_at', 'invoice_id'];

    protected $casts = [
        'date' => 'date',
        'completed_at' => 'datetime',
        'invoiced_at' => 'datetime',
        'invoice_id' => 'integer',
    ];

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function clientModel(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
