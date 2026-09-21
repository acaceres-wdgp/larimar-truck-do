<?php

namespace Tests\Feature\Trips;

use App\Models\Trip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TripStatusTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return User::factory()->create();
    }

    private function trip(string $status = 'Scheduled'): Trip
    {
        return Trip::factory()->create(['status' => $status]);
    }

    public function test_guest_cannot_update_trip_status(): void
    {
        $trip = $this->trip();

        $this->patchJson(route('trips.updateStatus', $trip), ['status' => 'At port'])
            ->assertUnauthorized();
    }

    public function test_status_can_be_updated(): void
    {
        $trip = $this->trip('Scheduled');

        $this->actingAs($this->user())
            ->patchJson(route('trips.updateStatus', $trip), ['status' => 'At port'])
            ->assertOk()
            ->assertJson(['ok' => true]);

        $this->assertDatabaseHas('trips', ['id' => $trip->id, 'status' => 'At port']);
    }

    public function test_all_valid_statuses_are_accepted(): void
    {
        $user = $this->user();

        foreach (Trip::STATUSES as $status) {
            $trip = $this->trip('Scheduled');

            $this->actingAs($user)
                ->patchJson(route('trips.updateStatus', $trip), ['status' => $status])
                ->assertOk();

            $this->assertDatabaseHas('trips', ['id' => $trip->id, 'status' => $status]);
        }
    }

    public function test_invalid_status_is_rejected(): void
    {
        $trip = $this->trip();

        $this->actingAs($this->user())
            ->patchJson(route('trips.updateStatus', $trip), ['status' => 'Flying'])
            ->assertUnprocessable();
    }

    public function test_missing_status_is_rejected(): void
    {
        $trip = $this->trip();

        $this->actingAs($this->user())
            ->patchJson(route('trips.updateStatus', $trip), [])
            ->assertUnprocessable();
    }

    public function test_status_update_does_not_alter_other_fields(): void
    {
        $trip = $this->trip('Scheduled');
        $originalClient = $trip->client;

        $this->actingAs($this->user())
            ->patchJson(route('trips.updateStatus', $trip), ['status' => 'Completed'])
            ->assertOk();

        $this->assertDatabaseHas('trips', [
            'id' => $trip->id,
            'status' => 'Completed',
            'client' => $originalClient,
        ]);
    }
}
