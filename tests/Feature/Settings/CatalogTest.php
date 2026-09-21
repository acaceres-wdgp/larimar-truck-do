<?php

namespace Tests\Feature\Settings;

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

class CatalogTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return User::factory()->create();
    }

    public function test_guests_are_redirected_from_catalogs(): void
    {
        $this->get(route('catalogs.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_visit_catalogs(): void
    {
        $this->actingAs($this->user())->get(route('catalogs.index'))->assertOk();
    }

    public function test_catalogs_returns_lines_cities_ports_props(): void
    {
        ShippingLine::create(['name' => 'TestLine', 'active' => true]);
        City::create(['name' => 'TestCity', 'active' => true]);
        Port::create(['name' => 'TestPort', 'active' => true]);

        $response = $this->actingAs($this->user())->get(route('catalogs.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('settings/catalogs')
            ->has('lines')
            ->has('cities')
            ->has('ports')
        );
    }

    public function test_can_create_shipping_line(): void
    {
        $this->actingAs($this->user())
            ->post(route('catalogs.lines.store'), ['name' => 'New Line', 'scac' => 'NEWL', 'contact' => null])
            ->assertRedirect(route('catalogs.index'));

        $this->assertDatabaseHas('shipping_lines', ['name' => 'New Line', 'scac' => 'NEWL']);
    }

    public function test_shipping_line_name_required(): void
    {
        $this->actingAs($this->user())
            ->post(route('catalogs.lines.store'), ['name' => '', 'scac' => null, 'contact' => null])
            ->assertSessionHasErrors('name');
    }

    public function test_duplicate_shipping_line_rejected(): void
    {
        ShippingLine::create(['name' => 'Maersk', 'active' => true]);

        $this->actingAs($this->user())
            ->post(route('catalogs.lines.store'), ['name' => 'Maersk'])
            ->assertSessionHasErrors('name');
    }

    public function test_can_update_shipping_line(): void
    {
        $line = ShippingLine::create(['name' => 'Old Name', 'active' => true]);

        $this->actingAs($this->user())
            ->patch(route('catalogs.lines.update', $line), ['name' => 'New Name', 'scac' => 'NEWN', 'contact' => null])
            ->assertRedirect(route('catalogs.index'));

        $this->assertDatabaseHas('shipping_lines', ['id' => $line->id, 'name' => 'New Name']);
    }

    public function test_can_toggle_shipping_line_active(): void
    {
        $line = ShippingLine::create(['name' => 'Toggle Line', 'active' => true]);

        $this->actingAs($this->user())
            ->patch(route('catalogs.lines.toggle', $line))
            ->assertRedirect(route('catalogs.index'));

        $this->assertDatabaseHas('shipping_lines', ['id' => $line->id, 'active' => false]);
    }

    public function test_can_delete_unused_shipping_line(): void
    {
        $line = ShippingLine::create(['name' => 'Deletable', 'active' => false]);

        $this->actingAs($this->user())
            ->delete(route('catalogs.lines.destroy', $line))
            ->assertRedirect(route('catalogs.index'));

        $this->assertDatabaseMissing('shipping_lines', ['id' => $line->id]);
    }

    public function test_delete_blocked_when_shipping_line_has_trips(): void
    {
        $line = ShippingLine::create(['name' => 'Busy Line', 'active' => true]);
        $client = Client::factory()->create();
        $truck = Truck::factory()->create(['status' => 'available']);
        $driver = Driver::factory()->create();

        Trip::create([
            'date' => now()->toDateString(),
            'type' => 'import',
            'client' => $client->name,
            'client_id' => $client->id,
            'line' => $line->name,
            'shipping_line_id' => $line->id,
            'from_location' => 'Origin',
            'to_location' => 'Dest',
            'status' => 'Scheduled',
            'km' => 100,
        ]);

        $this->actingAs($this->user())
            ->delete(route('catalogs.lines.destroy', $line))
            ->assertRedirect(route('catalogs.index'));

        $this->assertDatabaseHas('shipping_lines', ['id' => $line->id]);
    }

    public function test_can_create_city(): void
    {
        $this->actingAs($this->user())
            ->post(route('catalogs.cities.store'), ['name' => 'Nueva Ciudad', 'province' => 'Santiago', 'km_from_base' => 50])
            ->assertRedirect(route('catalogs.index'));

        $this->assertDatabaseHas('cities', ['name' => 'Nueva Ciudad', 'province' => 'Santiago']);
    }

    public function test_can_create_port(): void
    {
        $this->actingAs($this->user())
            ->post(route('catalogs.ports.store'), ['name' => 'Nuevo Puerto', 'code' => 'DONP', 'km_from_base' => 200])
            ->assertRedirect(route('catalogs.index'));

        $this->assertDatabaseHas('ports', ['name' => 'Nuevo Puerto', 'code' => 'DONP']);
    }

    public function test_duplicate_city_rejected(): void
    {
        City::create(['name' => 'Santiago', 'active' => true]);

        $this->actingAs($this->user())
            ->post(route('catalogs.cities.store'), ['name' => 'Santiago'])
            ->assertSessionHasErrors('name');
    }

    public function test_duplicate_port_rejected(): void
    {
        Port::create(['name' => 'Caucedo', 'active' => true]);

        $this->actingAs($this->user())
            ->post(route('catalogs.ports.store'), ['name' => 'Caucedo'])
            ->assertSessionHasErrors('name');
    }
}
