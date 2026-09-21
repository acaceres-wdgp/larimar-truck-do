<?php

namespace Tests\Feature\Trucks;

use App\Models\BodyType;
use App\Models\Truck;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BodyTypeFormTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return User::factory()->create();
    }

    private function seedBodyTypes(): void
    {
        BodyType::insert([
            ['name' => 'Tractor unit',       'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Flatbed',             'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Chassis (container)', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function test_create_form_receives_body_types_from_database(): void
    {
        $this->seedBodyTypes();

        $this->actingAs($this->user())
            ->get(route('trucks.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('trucks/form')
                ->has('bodyTypes', 3)
                ->where('bodyTypes.0', 'Tractor unit')
            );
    }

    public function test_edit_form_receives_body_types_from_database(): void
    {
        $this->seedBodyTypes();
        $truck = Truck::factory()->create(['plate' => 'TEST-001', 'make' => 'Volvo', 'status' => 'available', 'type' => 'Flatbed']);

        $this->actingAs($this->user())
            ->get(route('trucks.edit', $truck))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('trucks/form')
                ->has('bodyTypes', 3)
                ->where('truck.plate', 'TEST-001')
            );
    }

    public function test_create_form_body_types_are_ordered_by_sort_order(): void
    {
        BodyType::insert([
            ['name' => 'Dump',   'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Tanker', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $this->actingAs($this->user())
            ->get(route('trucks.create'))
            ->assertInertia(fn ($page) => $page->where('bodyTypes.0', 'Tanker')
                ->where('bodyTypes.1', 'Dump')
            );
    }
}
