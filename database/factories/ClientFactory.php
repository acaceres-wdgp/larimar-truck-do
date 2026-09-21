<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ClientFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'kind' => 'Company',
            'tax_id' => $this->faker->unique()->numerify('###-#####-#'),
            'contact_name' => $this->faker->name(),
            'contact_role' => 'Manager',
            'contact_phone' => $this->faker->phoneNumber(),
            'contact_email' => $this->faker->email(),
            'payment_terms' => '30 days',
            'credit_limit' => 1000000,
            'status' => 'Active',
            'logo_path' => null,
            'client_since' => $this->faker->dateTimeBetween('-3 years', 'now')->format('Y-m-d'),
        ];
    }
}
