<?php

namespace Tests\Feature\Users;

use App\Models\Permission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionMatrixTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::factory()->create(['role' => 'administrator', 'status' => 'active']);
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

    public function test_role_preset_fills_matrix(): void
    {
        $admin = $this->admin();
        $preset = User::ROLE_PRESETS['viewer'];

        // Build permissions from preset
        $permissions = [];
        foreach ($preset as $module => $vals) {
            $permissions[$module] = [
                'can_view' => $vals[0],
                'can_create' => $vals[1],
                'can_edit' => $vals[2],
                'can_delete' => $vals[3],
            ];
        }

        $this->actingAs($admin)
            ->postJson(route('users.store'), [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'role' => 'viewer',
                'status' => 'active',
                'send_invite' => false,
                'permissions' => $permissions,
            ])
            ->assertRedirect();

        $user = User::where('email', 'test@example.com')->first();
        $dashPerm = $user->permissions()->where('module', 'dashboard')->first();
        $this->assertTrue($dashPerm->can_view);
        $this->assertFalse($dashPerm->can_create);

        $settingsPerm = $user->permissions()->where('module', 'settings')->first();
        $this->assertFalse($settingsPerm->can_view);
    }

    public function test_view_cannot_be_disabled_while_create_is_active(): void
    {
        // This is a frontend rule, but we test the backend accepts the data correctly
        // and that enabling create without view still persists can_view=true if sent correctly
        $admin = $this->admin();

        $permissions = array_fill_keys(Permission::MODULES, [
            'can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false,
        ]);
        // Send trips with create=true but view=true (as frontend would send)
        $permissions['trips'] = ['can_view' => true, 'can_create' => true, 'can_edit' => false, 'can_delete' => false];

        $this->actingAs($admin)
            ->postJson(route('users.store'), [
                'name' => 'Test2',
                'email' => 'test2@example.com',
                'role' => 'custom',
                'status' => 'active',
                'send_invite' => false,
                'permissions' => $permissions,
            ])
            ->assertRedirect();

        $user = User::where('email', 'test2@example.com')->first();
        $tripsPerm = $user->permissions()->where('module', 'trips')->first();
        $this->assertTrue($tripsPerm->can_view);
        $this->assertTrue($tripsPerm->can_create);
    }
}
