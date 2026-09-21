<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    public const STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    public const TERMS_DAYS = ['net15' => 15, 'net30' => 30, 'net60' => 60, 'net90' => 90];

    protected $fillable = [
        'invoice_number', 'client_id', 'client',
        'subtotal', 'tax_rate', 'tax_amount', 'total',
        'status', 'payment_terms', 'issued_at', 'due_date', 'paid_at', 'notes',
    ];

    protected $casts = [
        'issued_at'  => 'date',
        'due_date'   => 'date',
        'paid_at'    => 'date',
        'subtotal'   => 'decimal:2',
        'tax_rate'   => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total'      => 'decimal:2',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function clientModel(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
}
