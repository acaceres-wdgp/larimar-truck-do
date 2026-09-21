<?php

namespace Tests\Feature\Drivers;

use App\Models\Driver;
use App\Models\Trip;
use App\Models\Truck;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DriverTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return User::factory()->create();
    }

    private function driverData(array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'Carlos',
            'last_name' => 'Bonilla',
            'license_number' => 'LIC-TEST-001',
            'status' => 'available',
        ], $overrides);
    }

    public function test_guests_are_redirected_from_drivers_index(): void
    {
        $this->get(route('drivers.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_visit_drivers_index(): void
    {
        $this->actingAs($this->user())->get(route('drivers.index'))->assertOk();
    }

    public function test_index_returns_drivers_prop(): void
    {
        Driver::factory()->create(['first_name' => 'Carlos', 'last_name' => 'Bonilla', 'status' => 'available']);

        $response = $this->actingAs($this->user())->get(route('drivers.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('drivers/index')
            ->has('drivers', 1)
            ->where('drivers.0.first_name', 'Carlos')
        );
    }

    public function test_create_page_is_accessible(): void
    {
        $this->actingAs($this->user())->get(route('drivers.create'))->assertOk();
    }

    public function test_valid_driver_can_be_created(): void
    {
        $this->actingAs($this->user())
            ->post(route('drivers.store'), $this->driverData())
            ->assertRedirect(route('drivers.index'));

        $this->assertDatabaseHas('drivers', ['first_name' => 'Carlos', 'last_name' => 'Bonilla']);
    }

    public function test_first_name_is_required(): void
    {
        $this->actingAs($this->user())
            ->post(route('drivers.store'), $this->driverData(['first_name' => '']))
            ->assertSessionHasErrors('first_name');
    }

    public function test_last_name_is_required(): void
    {
        $this->actingAs($this->user())
            ->post(route('drivers.store'), $this->driverData(['last_name' => '']))
            ->assertSessionHasErrors('last_name');
    }

    public function test_license_number_is_required(): void
    {
        $this->actingAs($this->user())
            ->post(route('drivers.store'), $this->driverData(['license_number' => '']))
            ->assertSessionHasErrors('license_number');
    }

    public function test_duplicate_license_is_rejected(): void
    {
        Driver::factory()->create(['license_number' => 'LIC-TEST-001']);

        $this->actingAs($this->user())
            ->post(route('drivers.store'), $this->driverData(['license_number' => 'LIC-TEST-001']))
            ->assertSessionHasErrors('license_number');
    }

    public function test_license_is_normalized_on_create(): void
    {
        $this->actingAs($this->user())
            ->post(route('drivers.store'), $this->driverData(['license_number' => 'lic-test-001']))
            ->assertRedirect(route('drivers.index'));

        $this->assertDatabaseHas('drivers', ['license_number' => 'LIC-TEST-001']);
    }

    public function test_driver_can_be_edited(): void
    {
        $driver = Driver::factory()->create(['first_name' => 'Carlos', 'last_name' => 'Bonilla', 'status' => 'available']);

        $this->actingAs($this->user())
            ->get(route('drivers.edit', $driver))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('drivers/form')
                ->where('driver.first_name', 'Carlos')
            );
    }

    public function test_driver_can_be_updated(): void
    {
        $driver = Driver::factory()->create(['first_name' => 'Carlos', 'last_name' => 'Bonilla', 'status' => 'available']);

        $this->actingAs($this->user())
            ->put(route('drivers.update', $driver), $this->driverData(['first_name' => 'Carlos', 'last_name' => 'Pérez']))
            ->assertRedirect(route('drivers.index'));

        $this->assertDatabaseHas('drivers', ['id' => $driver->id, 'last_name' => 'Pérez']);
    }

    public function test_duplicate_license_ignores_self_on_update(): void
    {
        $driver = Driver::factory()->create(['license_number' => 'LIC-TEST-001', 'status' => 'available']);

        $this->actingAs($this->user())
            ->put(route('drivers.update', $driver), $this->driverData(['license_number' => 'LIC-TEST-001']))
            ->assertRedirect(route('drivers.index'));
    }

    public function test_driver_can_be_deleted(): void
    {
        $driver = Driver::factory()->create(['status' => 'available']);

        $this->actingAs($this->user())
            ->delete(route('drivers.destroy', $driver))
            ->assertRedirect(route('drivers.index'));

        $this->assertDatabaseMissing('drivers', ['id' => $driver->id]);
    }

    public function test_truck_profile_loads(): void
    {
        $truck = Truck::factory()->create(['plate' => 'AM-2021', 'make' => 'Freightliner', 'status' => 'available']);

        $this->actingAs($this->user())
            ->get(route('trucks.show', $truck))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('trucks/show')
                ->has('truck')
                ->has('trips')
            );
    }

    public function test_truck_profile_shows_only_its_trips(): void
    {
        $truck1 = Truck::factory()->create(['plate' => 'AM-2021', 'make' => 'Freightliner', 'status' => 'available']);
        $truck2 = Truck::factory()->create(['plate' => 'AM-2044', 'make' => 'International', 'status' => 'available']);
        $driver1 = Driver::factory()->create();

        Trip::create([
            'date' => '2025-08-01', 'type' => 'import', 'client' => 'Client A', 'line' => 'MSC',
            'from_location' => 'SDQ', 'to_location' => 'HAINA',
            'truck_id' => $truck1->id, 'driver_id' => $driver1->id, 'status' => 'Completed', 'km' => 18,
        ]);
        Trip::create([
            'date' => '2025-08-02', 'type' => 'export', 'client' => 'Client B', 'line' => 'ONE',
            'from_location' => 'HAINA', 'to_location' => 'SDQ',
            'truck_id' => $truck2->id, 'driver_id' => $driver1->id, 'status' => 'Completed', 'km' => 18,
        ]);

        $this->actingAs($this->user())
            ->get(route('trucks.show', $truck1))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('trucks/show')
                ->has('trips', 1)
                ->where('trips.0.client', 'Client A')
            );
    }

    public function test_driver_profile_loads(): void
    {
        $driver = Driver::factory()->create(['status' => 'available']);

        $this->actingAs($this->user())
            ->get(route('drivers.show', $driver))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('drivers/show')
                ->has('driver')
                ->has('trips')
            );
    }

    public function test_driver_profile_shows_only_its_trips(): void
    {
        $truck = Truck::factory()->create(['plate' => 'AM-2021', 'make' => 'Freightliner', 'status' => 'available']);
        $driver1 = Driver::factory()->create(['status' => 'available']);
        $driver2 = Driver::factory()->create(['status' => 'available']);

        Trip::create([
            'date' => '2025-08-01', 'type' => 'import', 'client' => 'Client A', 'line' => 'MSC',
            'from_location' => 'SDQ', 'to_location' => 'HAINA',
            'truck_id' => $truck->id, 'driver_id' => $driver1->id, 'status' => 'Completed', 'km' => 18,
        ]);
        Trip::create([
            'date' => '2025-08-02', 'type' => 'export', 'client' => 'Client B', 'line' => 'ONE',
            'from_location' => 'HAINA', 'to_location' => 'SDQ',
            'truck_id' => $truck->id, 'driver_id' => $driver2->id, 'status' => 'Completed', 'km' => 18,
        ]);

        $this->actingAs($this->user())
            ->get(route('drivers.show', $driver1))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('drivers/show')
                ->has('trips', 1)
                ->where('trips.0.client', 'Client A')
            );
    }
}
