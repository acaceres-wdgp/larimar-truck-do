<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'kind', 'tax_id', 'contact_name', 'contact_role',
        'contact_phone', 'contact_email', 'payment_terms', 'credit_limit',
        'status', 'logo_path', 'client_since',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'client_since' => 'date',
    ];

    public const KINDS = ['Company', 'Individual'];

    public const PAYMENT_TERMS = ['Cash on delivery', '15 days', '30 days', '45 days', '60 days'];

    public const STATUSES = ['Active', 'Inactive'];

    public function trips(): HasMany
    {
        return $this->hasMany(Trip::class);
    }

    public function getInitialsAttribute(): string
    {
        $words = preg_split('/\s+/', trim($this->name));
        if (count($words) >= 2) {
            return strtoupper(mb_substr($words[0], 0, 1).mb_substr($words[1], 0, 1));
        }

        return strtoupper(mb_substr($this->name, 0, 2));
    }
}
