<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            ['name' => 'Santiago',                    'province' => 'Santiago',           'km_from_base' => 0, 'active' => true],
            ['name' => 'Moca',                        'province' => 'Espaillat',          'km_from_base' => 34, 'active' => true],
            ['name' => 'La Vega',                     'province' => 'La Vega',            'km_from_base' => 75, 'active' => true],
            ['name' => 'Puerto Plata',                'province' => 'Puerto Plata',       'km_from_base' => 84, 'active' => true],
            ['name' => 'Bonao',                       'province' => 'Monseñor Nouel',     'km_from_base' => 112, 'active' => true],
            ['name' => 'Santo Domingo',               'province' => 'Distrito Nacional',  'km_from_base' => 155, 'active' => true],
            ['name' => 'San Francisco de Macorís',    'province' => 'Duarte',             'km_from_base' => 96, 'active' => false],
        ];
        foreach ($cities as $d) {
            City::create($d);
        }
    }
}
