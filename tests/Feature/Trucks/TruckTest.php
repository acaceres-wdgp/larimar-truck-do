<?php

namespace Tests\Feature\Trucks;

use App\Models\Truck;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TruckTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return User::factory()->create();
    }

    private function truckData(array $overrides = []): array
    {
        return array_merge([
            'plate' => 'TEST-001',
            'make' => 'Freightliner',
            'status' => 'available',
        ], $overrides);
    }

    public function test_guests_are_redirected_from_trucks_index(): void
    {
        $this->get(route('trucks.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_visit_trucks_index(): void
    {
        $this->actingAs($this->user())->get(route('trucks.index'))->assertOk();
    }

    public function test_index_returns_trucks_prop(): void
    {
        $truck = Truck::factory()->create(['plate' => 'AM-2021', 'make' => 'Freightliner', 'status' => 'available']);

        $response = $this->actingAs($this->user())->get(route('trucks.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('trucks/index')
            ->has('trucks', 1)
            ->where('trucks.0.plate', 'AM-2021')
        );
    }

    public function test_create_page_is_accessible(): void
    {
        $this->actingAs($this->user())->get(route('trucks.create'))->assertOk();
    }

    public function test_valid_truck_can_be_created(): void
    {
        $this->actingAs($this->user())
            ->post(route('trucks.store'), $this->truckData())
            ->assertRedirect(route('trucks.index'));

        $this->assertDatabaseHas('trucks', ['plate' => 'TEST-001', 'make' => 'Freightliner']);
    }

    public function test_plate_is_required(): void
    {
        $this->actingAs($this->user())
            ->post(route('trucks.store'), $this->truckData(['plate' => '']))
            ->assertSessionHasErrors('plate');
    }

    public function test_make_is_required(): void
    {
        $this->actingAs($this->user())
            ->post(route('trucks.store'), $this->truckData(['make' => '']))
            ->assertSessionHasErrors('make');
    }

    public function test_duplicate_plate_is_rejected(): void
    {
        Truck::factory()->create(['plate' => 'AM-2021', 'make' => 'Freightliner', 'status' => 'available']);

        $this->actingAs($this->user())
            ->post(route('trucks.store'), $this->truckData(['plate' => 'AM-2021']))
            ->assertSessionHasErrors('plate');
    }

    public function test_plate_is_normalized_on_create(): void
    {
        $this->actingAs($this->user())
            ->post(route('trucks.store'), $this->truckData(['plate' => ' am-2021 ']))
            ->assertRedirect(route('trucks.index'));

        $this->assertDatabaseHas('trucks', ['plate' => 'AM-2021']);
    }

    public function test_truck_can_be_edited(): void
    {
        $truck = Truck::factory()->create(['plate' => 'AM-2021', 'make' => 'Freightliner', 'status' => 'available']);

        $this->actingAs($this->user())
            ->get(route('trucks.edit', $truck))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('trucks/form')
                ->where('truck.plate', 'AM-2021')
            );
    }

    public function test_truck_can_be_updated(): void
    {
        $truck = Truck::factory()->create(['plate' => 'AM-2021', 'make' => 'Freightliner', 'status' => 'available']);

        $this->actingAs($this->user())
            ->put(route('trucks.update', $truck), $this->truckData(['plate' => 'AM-2021', 'make' => 'Volvo']))
            ->assertRedirect(route('trucks.index'));

        $this->assertDatabaseHas('trucks', ['id' => $truck->id, 'make' => 'Volvo']);
    }

    public function test_duplicate_plate_ignores_self_on_update(): void
    {
        $truck = Truck::factory()->create(['plate' => 'AM-2021', 'make' => 'Freightliner', 'status' => 'available']);

        $this->actingAs($this->user())
            ->put(route('trucks.update', $truck), $this->truckData(['plate' => 'AM-2021']))
            ->assertRedirect(route('trucks.index'));
    }

    public function test_truck_can_be_deleted(): void
    {
        $truck = Truck::factory()->create(['plate' => 'AM-2021', 'make' => 'Freightliner', 'status' => 'available']);

        $this->actingAs($this->user())
            ->delete(route('trucks.destroy', $truck))
            ->assertRedirect(route('trucks.index'));

        $this->assertDatabaseMissing('trucks', ['id' => $truck->id]);
    }

    public function test_update_persists_all_editable_fields(): void
    {
        $truck = Truck::factory()->create(['plate' => 'AM-2021', 'make' => 'Freightliner', 'status' => 'available']);

        $this->actingAs($this->user())
            ->put(route('trucks.update', $truck), [
                'plate' => 'AM-9999',
                'make' => 'Volvo',
                'model' => 'VNL 760',
                'year' => 2022,
                'status' => 'in_maintenance',
                'capacity_tons' => 28.5,
                'odometer_km' => 150000,
                'insurance_expires_at' => '2027-06-01',
                'inspection_expires_at' => '2027-03-15',
                'notes' => 'Engine overhaul done.',
            ])
            ->assertRedirect(route('trucks.index'));

        $this->assertDatabaseHas('trucks', [
            'id' => $truck->id,
            'plate' => 'AM-9999',
            'make' => 'Volvo',
            'model' => 'VNL 760',
            'year' => 2022,
            'status' => 'in_maintenance',
            'odometer_km' => 150000,
            'notes' => 'Engine overhaul done.',
        ]);

        $updated = $truck->fresh();
        $this->assertSame('2027-06-01', $updated->insurance_expires_at->format('Y-m-d'));
        $this->assertSame('2027-03-15', $updated->inspection_expires_at->format('Y-m-d'));
    }

    public function test_plate_is_normalized_on_update(): void
    {
        $truck = Truck::factory()->create(['plate' => 'AM-2021', 'make' => 'Freightliner', 'status' => 'available']);

        $this->actingAs($this->user())
            ->put(route('trucks.update', $truck), $this->truckData(['plate' => ' am-9999 ']))
            ->assertRedirect(route('trucks.index'));

        $this->assertDatabaseHas('trucks', ['id' => $truck->id, 'plate' => 'AM-9999']);
    }

    public function test_invalid_status_is_rejected_on_update(): void
    {
        $truck = Truck::factory()->create(['plate' => 'AM-2021', 'make' => 'Freightliner', 'status' => 'available']);

        $this->actingAs($this->user())
            ->put(route('trucks.update', $truck), $this->truckData(['status' => 'broken']))
            ->assertSessionHasErrors('status');
    }
}
