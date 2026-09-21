<?php

namespace Tests\Feature\Users;

use App\Models\Permission;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::factory()->create(['role' => 'administrator', 'status' => 'active']);
        // Give full permissions
        foreach (Permission::MODULES as $module) {
            Permission::create([
                'user_id' => $admin->id,
                'module' => $module,
                'can_view' => true,
                'can_create' => true,
                'can_edit' => true,
                'can_delete' => true,
            ]);
        }

        return $admin;
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'role' => 'viewer',
            'status' => 'active',
            'send_invite' => false,
            'permissions' => [
                'dashboard' => ['can_view' => true, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'trips' => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'trucks' => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'drivers' => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'clients' => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'invoices' => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'reports' => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'settings' => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
            ],
        ], $overrides);
    }

    public function test_valid_user_is_created(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->postJson(route('users.store'), $this->validPayload())
            ->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', ['email' => 'jane@example.com', 'role' => 'viewer']);
    }

    public function test_name_is_required(): void
    {
        $this->actingAs($this->admin())
            ->postJson(route('users.store'), $this->validPayload(['name' => '']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_invalid_email_is_rejected(): void
    {
        $this->actingAs($this->admin())
            ->postJson(route('users.store'), $this->validPayload(['email' => 'not-an-email']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_duplicate_email_is_rejected(): void
    {
        User::factory()->create(['email' => 'jane@example.com']);

        $this->actingAs($this->admin())
            ->postJson(route('users.store'), $this->validPayload())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_no_module_access_is_rejected(): void
    {
        $allOff = array_fill_keys(Permission::MODULES, ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false]);

        $this->actingAs($this->admin())
            ->postJson(route('users.store'), $this->validPayload(['permissions' => $allOff]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['permissions']);
    }

    public function test_cannot_delete_own_account(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->deleteJson(route('users.destroy', $admin))
            ->assertForbidden();
    }

    public function test_cannot_remove_last_active_administrator(): void
    {
        // Two admins: admin and admin2. admin2 tries to delete admin (the only admin if admin2 is viewer)
        // Actually: admin is the only active administrator; a second user tries to delete admin.
        // But destroy checks: if admin is being deleted AND is last active admin → 403.
        // The deleter can be anyone authenticated (auth check), admin protection is separate.
        $admin = $this->admin();
        $admin2 = $this->admin(); // second admin also gets full permissions

        // Now demote admin2 to viewer so admin is the only active administrator
        $admin2->update(['role' => 'viewer']);

        // admin2 (now viewer) tries to delete admin (the only active administrator) → should be 403
        $this->actingAs($admin2)
            ->deleteJson(route('users.destroy', $admin))
            ->assertForbidden();
    }

    public function test_user_without_can_edit_gets_403_on_trips(): void
    {
        $user = User::factory()->create(['role' => 'viewer', 'status' => 'active']);
        Permission::create([
            'user_id' => $user->id,
            'module' => 'trips',
            'can_view' => true,
            'can_create' => false,
            'can_edit' => false,
            'can_delete' => false,
        ]);

        $trip = Trip::factory()->create();

        $this->actingAs($user)
            ->putJson(route('trips.update', $trip), ['date' => '2026-01-01', 'type' => 'import', 'status' => 'Scheduled'])
            ->assertForbidden();
    }
}
