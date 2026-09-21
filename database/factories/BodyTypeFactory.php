<?php

namespace Database\Factories;

use App\Models\BodyType;
use Illuminate\Database\Eloquent\Factories\Factory;

class BodyTypeFactory extends Factory
{
    protected $model = BodyType::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
            'sort_order' => $this->faker->numberBetween(1, 99),
        ];
    }
}
