<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string|null $job_title
 * @property string $role
 * @property string $status
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $last_active_at
 * @property Carbon|null $invited_at
 * @property string|null $invitation_token
 * @property Carbon|null $invitation_expires_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    public const ROLES = ['administrator', 'operations', 'dispatcher', 'accountant', 'viewer', 'custom'];

    public const STATUSES = ['active', 'invited', 'suspended'];

    public const ROLE_PRESETS = [
        'administrator' => [
            'dashboard' => [true, true, true, true],
            'trips' => [true, true, true, true],
            'trucks' => [true, true, true, true],
            'drivers' => [true, true, true, true],
            'clients' => [true, true, true, true],
            'invoices' => [true, true, true, true],
            'reports' => [true, true, true, true],
            'settings' => [true, true, true, true],
        ],
        'operations' => [
            'dashboard' => [true, false, false, false],
            'trips' => [true, true, true, true],
            'trucks' => [true, true, true, false],
            'drivers' => [true, true, true, false],
            'clients' => [true, true, true, false],
            'invoices' => [true, false, false, false],
            'reports' => [true, false, false, false],
            'settings' => [false, false, false, false],
        ],
        'dispatcher' => [
            'dashboard' => [true, false, false, false],
            'trips' => [true, true, true, false],
            'trucks' => [true, false, false, false],
            'drivers' => [true, false, false, false],
            'clients' => [true, false, false, false],
            'invoices' => [false, false, false, false],
            'reports' => [false, false, false, false],
            'settings' => [false, false, false, false],
        ],
        'accountant' => [
            'dashboard' => [true, false, false, false],
            'trips' => [true, false, false, false],
            'trucks' => [false, false, false, false],
            'drivers' => [false, false, false, false],
            'clients' => [true, true, true, false],
            'invoices' => [true, true, true, true],
            'reports' => [true, false, false, false],
            'settings' => [false, false, false, false],
        ],
        'viewer' => [
            'dashboard' => [true, false, false, false],
            'trips' => [true, false, false, false],
            'trucks' => [true, false, false, false],
            'drivers' => [true, false, false, false],
            'clients' => [true, false, false, false],
            'invoices' => [false, false, false, false],
            'reports' => [true, false, false, false],
            'settings' => [false, false, false, false],
        ],
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'job_title',
        'role',
        'status',
        'last_active_at',
        'invited_at',
        'invitation_token',
        'invitation_expires_at',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'last_active_at' => 'datetime',
            'invited_at' => 'datetime',
            'invitation_expires_at' => 'datetime',
        ];
    }

    public function permissions(): HasMany
    {
        return $this->hasMany(Permission::class);
    }

    public function canDo(string $module, string $action): bool
    {
        // If the user has no permission rows at all, treat as full access
        // (legacy accounts predating the permissions system, or the bootstrap admin)
        if ($this->permissions()->count() === 0) {
            return true;
        }

        $permission = $this->permissions()->where('module', $module)->first();
        if (! $permission) {
            return false;
        }
        $field = "can_{$action}";

        return (bool) ($permission->{$field} ?? false);
    }

    public function permissionsMap(): array
    {
        $map = [];
        foreach ($this->permissions as $p) {
            $map[$p->module] = [
                'can_view' => $p->can_view,
                'can_create' => $p->can_create,
                'can_edit' => $p->can_edit,
                'can_delete' => $p->can_delete,
            ];
        }

        return $map;
    }
}
