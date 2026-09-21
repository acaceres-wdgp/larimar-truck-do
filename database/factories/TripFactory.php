<?php

namespace Database\Factories;

use App\Models\Trip;
use Illuminate\Database\Eloquent\Factories\Factory;

class TripFactory extends Factory
{
    protected $model = Trip::class;

    public function definition(): array
    {
        return [
            'date' => $this->faker->dateTimeBetween('-30 days', '+30 days')->format('Y-m-d'),
            'type' => $this->faker->randomElement(['import', 'export']),
            'client' => $this->faker->company(),
            'line' => $this->faker->randomElement(['Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'Evergreen']),
            'from_location' => $this->faker->city(),
            'to_location' => $this->faker->city(),
            'truck_id' => null,
            'driver_id' => null,
            'status' => $this->faker->randomElement(Trip::STATUSES),
            'km' => $this->faker->randomFloat(1, 10, 500),
        ];
    }
}
