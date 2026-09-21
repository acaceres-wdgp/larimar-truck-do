<?php

namespace Tests\Feature\Clients;

use App\Models\Client;
use App\Models\Driver;
use App\Models\Trip;
use App\Models\Truck;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return User::factory()->create();
    }

    private function clientData(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Test Company SRL',
            'kind' => 'Company',
            'tax_id' => '130-99999-1',
            'payment_terms' => '30 days',
            'status' => 'Active',
        ], $overrides);
    }

    public function test_guests_are_redirected_from_clients_index(): void
    {
        $this->get(route('clients.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_visit_clients_index(): void
    {
        $this->actingAs($this->user())->get(route('clients.index'))->assertOk();
    }

    public function test_index_returns_clients_prop(): void
    {
        Client::factory()->create(['name' => 'Test Company SRL', 'status' => 'Active']);

        $response = $this->actingAs($this->user())->get(route('clients.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('clients/index')
            ->has('clients', 1)
            ->where('clients.0.name', 'Test Company SRL')
        );
    }

    public function test_create_page_is_accessible(): void
    {
        $this->actingAs($this->user())->get(route('clients.create'))->assertOk();
    }

    public function test_valid_client_can_be_created(): void
    {
        $this->actingAs($this->user())
            ->post(route('clients.store'), $this->clientData())
            ->assertRedirect(route('clients.index'));

        $this->assertDatabaseHas('clients', ['name' => 'Test Company SRL', 'tax_id' => '130-99999-1']);
    }

    public function test_name_is_required(): void
    {
        $this->actingAs($this->user())
            ->post(route('clients.store'), $this->clientData(['name' => '']))
            ->assertSessionHasErrors('name');
    }

    public function test_tax_id_is_required(): void
    {
        $this->actingAs($this->user())
            ->post(route('clients.store'), $this->clientData(['tax_id' => '']))
            ->assertSessionHasErrors('tax_id');
    }

    public function test_duplicate_tax_id_is_rejected(): void
    {
        Client::factory()->create(['tax_id' => '130-99999-1']);

        $this->actingAs($this->user())
            ->post(route('clients.store'), $this->clientData(['tax_id' => '130-99999-1']))
            ->assertSessionHasErrors('tax_id');
    }

    public function test_client_can_be_edited(): void
    {
        $client = Client::factory()->create(['name' => 'Test Company SRL', 'status' => 'Active']);

        $this->actingAs($this->user())
            ->get(route('clients.edit', $client))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('clients/form')
                ->where('client.name', 'Test Company SRL')
            );
    }

    public function test_client_can_be_updated(): void
    {
        $client = Client::factory()->create(['name' => 'Test Company SRL', 'status' => 'Active']);

        $this->actingAs($this->user())
            ->put(route('clients.update', $client), $this->clientData(['name' => 'Updated Company SRL']))
            ->assertRedirect(route('clients.index'));

        $this->assertDatabaseHas('clients', ['id' => $client->id, 'name' => 'Updated Company SRL']);
    }

    public function test_duplicate_tax_id_ignores_self_on_update(): void
    {
        $client = Client::factory()->create(['tax_id' => '130-99999-1', 'status' => 'Active']);

        $this->actingAs($this->user())
            ->put(route('clients.update', $client), $this->clientData(['tax_id' => '130-99999-1']))
            ->assertRedirect(route('clients.index'));
    }

    public function test_client_can_be_deleted(): void
    {
        $client = Client::factory()->create(['status' => 'Active']);

        $this->actingAs($this->user())
            ->delete(route('clients.destroy', $client))
            ->assertRedirect(route('clients.index'));

        $this->assertDatabaseMissing('clients', ['id' => $client->id]);
    }

    public function test_client_profile_loads(): void
    {
        $client = Client::factory()->create(['status' => 'Active']);

        $this->actingAs($this->user())
            ->get(route('clients.show', $client))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('clients/show')
                ->has('client')
                ->has('trips')
                ->has('metrics')
            );
    }

    public function test_client_profile_shows_only_its_trips(): void
    {
        $truck = Truck::factory()->create(['plate' => 'AM-2021', 'make' => 'Freightliner', 'status' => 'available']);
        $driver = Driver::factory()->create(['status' => 'available']);
        $client1 = Client::factory()->create(['status' => 'Active']);
        $client2 = Client::factory()->create(['status' => 'Active']);

        Trip::create([
            'date' => '2025-08-01', 'type' => 'import', 'client' => $client1->name, 'client_id' => $client1->id,
            'line' => 'MSC', 'from_location' => 'Caucedo', 'to_location' => 'Santiago',
            'truck_id' => $truck->id, 'driver_id' => $driver->id, 'status' => 'Completed', 'km' => 212,
        ]);
        Trip::create([
            'date' => '2025-08-02', 'type' => 'export', 'client' => $client2->name, 'client_id' => $client2->id,
            'line' => 'ONE', 'from_location' => 'Santiago', 'to_location' => 'Caucedo',
            'truck_id' => $truck->id, 'driver_id' => $driver->id, 'status' => 'Completed', 'km' => 212,
        ]);

        $this->actingAs($this->user())
            ->get(route('clients.show', $client1))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('clients/show')
                ->has('trips', 1)
                ->where('trips.0.client', $client1->name)
            );
    }
}
