<?php

namespace Tests\Feature\Trips;

use App\Models\City;
use App\Models\Client;
use App\Models\Driver;
use App\Models\Port;
use App\Models\ShippingLine;
use App\Models\Trip;
use App\Models\Truck;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleTripTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return User::factory()->create();
    }

    private function fixtures(): array
    {
        $client = Client::factory()->create(['status' => 'Active']);
        $line = ShippingLine::firstOrCreate(['name' => 'Maersk'], ['active' => true]);
        $port = Port::firstOrCreate(['name' => 'Caucedo'], ['code' => 'DOCAU', 'km_from_base' => 214, 'active' => true]);
        $city = City::firstOrCreate(['name' => 'Santiago'], ['province' => 'Santiago', 'km_from_base' => 0, 'active' => true]);
        $truck = Truck::factory()->create(['status' => 'available']);
        $driver = Driver::factory()->create(['status' => 'available']);

        return compact('client', 'line', 'port', 'city', 'truck', 'driver');
    }

    private function tripPayload(array $overrides = []): array
    {
        $f = $this->fixtures();

        return array_merge([
            'order_number' => 'TRP-1001',
            'direction' => 'import',
            'trip_date' => now()->addDays(3)->toDateString(),
            'client_id' => $f['client']->id,
            'shipping_line_id' => $f['line']->id,
            'origin_type' => 'port',
            'origin_id' => $f['port']->id,
            'destination_type' => 'city',
            'destination_id' => $f['city']->id,
            'distance_km' => 214,
            'status' => 'Scheduled',
            'container_number' => 'MSKU1234567',
            'container_size' => "40'",
            'cargo_type' => 'Dry',
            'weight_tons' => null,
            'truck_id' => $f['truck']->id,
            'driver_id' => $f['driver']->id,
            'rate' => null,
            'fuel_cost' => null,
            'toll_cost' => null,
            'driver_pay' => null,
        ], $overrides);
    }

    public function test_guests_are_redirected_from_trip_create(): void
    {
        $this->get(route('trips.create'))->assertRedirect(route('login'));
    }

    public function test_create_page_is_accessible(): void
    {
        $this->actingAs($this->user())->get(route('trips.create'))->assertOk();
    }

    public function test_valid_trip_can_be_scheduled(): void
    {
        $this->actingAs($this->user())
            ->post(route('trips.store'), $this->tripPayload())
            ->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('trips', ['order_number' => 'TRP-1001', 'type' => 'import', 'status' => 'Scheduled']);
    }

    public function test_truck_and_driver_can_be_empty(): void
    {
        $payload = $this->tripPayload(['truck_id' => null, 'driver_id' => null]);

        $this->actingAs($this->user())
            ->post(route('trips.store'), $payload)
            ->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('trips', ['truck_id' => null, 'driver_id' => null]);
    }

    public function test_trip_date_is_required(): void
    {
        $this->actingAs($this->user())
            ->post(route('trips.store'), $this->tripPayload(['trip_date' => '']))
            ->assertSessionHasErrors('trip_date');
    }

    public function test_client_is_required(): void
    {
        $this->actingAs($this->user())
            ->post(route('trips.store'), $this->tripPayload(['client_id' => '']))
            ->assertSessionHasErrors('client_id');
    }

    public function test_shipping_line_is_required(): void
    {
        $this->actingAs($this->user())
            ->post(route('trips.store'), $this->tripPayload(['shipping_line_id' => '']))
            ->assertSessionHasErrors('shipping_line_id');
    }

    public function test_origin_and_destination_required(): void
    {
        $this->actingAs($this->user())
            ->post(route('trips.store'), $this->tripPayload(['origin_type' => '']))
            ->assertSessionHasErrors('origin_type');
    }

    public function test_same_origin_and_destination_rejected(): void
    {
        $f = $this->fixtures();

        $payload = $this->tripPayload([
            'origin_type' => 'port',
            'origin_id' => $f['port']->id,
            'destination_type' => 'port',
            'destination_id' => $f['port']->id,
        ]);

        $this->actingAs($this->user())
            ->post(route('trips.store'), $payload)
            ->assertSessionHasErrors('destination_id');
    }

    public function test_margin_calculated_correctly(): void
    {
        $payload = $this->tripPayload([
            'rate' => 30000,
            'fuel_cost' => 9000,
            'toll_cost' => 1200,
            'driver_pay' => 4500,
        ]);

        $this->actingAs($this->user())
            ->post(route('trips.store'), $payload)
            ->assertRedirect(route('dashboard'));

        $trip = Trip::latest()->first();
        $this->assertEquals(30000, (float) $trip->rate);
        $this->assertEquals(9000, (float) $trip->fuel_cost);
        $this->assertEquals(1200, (float) $trip->toll_cost);
        $this->assertEquals(4500, (float) $trip->driver_pay);
        $this->assertEquals(15300, $trip->margin);
    }

    public function test_trip_appears_on_board_for_today(): void
    {
        $f = $this->fixtures();

        Trip::create([
            'date' => now()->toDateString(),
            'type' => 'import',
            'client' => $f['client']->name,
            'client_id' => $f['client']->id,
            'line' => $f['line']->name,
            'shipping_line_id' => $f['line']->id,
            'from_location' => 'Caucedo',
            'to_location' => 'Santiago',
            'status' => 'Scheduled',
            'km' => 214,
        ]);

        $response = $this->actingAs($this->user())->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('dashboard')
            ->has('dbTrips', 1)
        );
    }
}
