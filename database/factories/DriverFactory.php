<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DriverFactory extends Factory
{
    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'national_id' => $this->faker->numerify('###-#######-#'),
            'phone' => $this->faker->phoneNumber(),
            'emergency_contact' => $this->faker->name().' '.$this->faker->phoneNumber(),
            'license_number' => strtoupper($this->faker->bothify('??-######')),
            'license_category' => 'Category 04 (heavy)',
            'license_expires_at' => $this->faker->dateTimeBetween('+6 months', '+3 years')->format('Y-m-d'),
            'status' => 'available',
            'notes' => null,
            'photo_path' => null,
        ];
    }
}
