<?php

namespace Database\Factories;

use App\Models\Truck;
use Illuminate\Database\Eloquent\Factories\Factory;

class TruckFactory extends Factory
{
    protected $model = Truck::class;

    public function definition(): array
    {
        return [
            'plate' => strtoupper($this->faker->unique()->bothify('??-####')),
            'vin' => strtoupper($this->faker->bothify('??#?######?#####')),
            'make' => $this->faker->randomElement(['Freightliner', 'Volvo', 'Kenworth', 'Mack']),
            'model' => $this->faker->word(),
            'year' => $this->faker->numberBetween(2010, 2023),
            'type' => $this->faker->randomElement(Truck::BODY_TYPES),
            'capacity_tons' => $this->faker->randomFloat(1, 10, 35),
            'odometer_km' => $this->faker->numberBetween(10000, 800000),
            'status' => $this->faker->randomElement(Truck::STATUSES),
            'insurance_expires_at' => $this->faker->dateTimeBetween('+1 month', '+2 years')->format('Y-m-d'),
            'inspection_expires_at' => $this->faker->dateTimeBetween('+1 month', '+2 years')->format('Y-m-d'),
            'notes' => null,
            'photo_path' => null,
        ];
    }
}
