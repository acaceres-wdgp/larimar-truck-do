<?php

namespace Database\Seeders;

use App\Models\BodyType;
use Illuminate\Database\Seeder;

class BodyTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            'Tractor unit',
            'Rigid box',
            'Flatbed',
            'Chassis (container)',
            'Tanker',
            'Dump',
        ];

        foreach ($types as $i => $name) {
            BodyType::firstOrCreate(['name' => $name], ['sort_order' => $i + 1]);
        }
    }
}
