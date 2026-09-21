<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Trip;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        Trip::all()->each(function (Trip $trip) {
            $orderStatus = match ($trip->status) {
                'Completed' => 'ready',
                'Cancelled' => 'cancelled',
                default => 'open',
            };

            $completedAt = $orderStatus === 'ready' ? $trip->updated_at : null;

            Order::create([
                'trip_id' => $trip->id,
                'client_id' => $trip->client_id,
                'client' => $trip->client,
                'date' => $trip->date,
                'status' => $orderStatus,
                'completed_at' => $completedAt,
            ]);
        });
    }
}
