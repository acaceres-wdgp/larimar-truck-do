<?php

namespace Database\Seeders;

use App\Models\Port;
use Illuminate\Database\Seeder;

class PortSeeder extends Seeder
{
    public function run(): void
    {
        $ports = [
            ['name' => 'Caucedo',     'code' => 'DOCAU', 'km_from_base' => 214, 'active' => true],
            ['name' => 'Río Haina',   'code' => 'DOHAI', 'km_from_base' => 196, 'active' => true],
            ['name' => 'Puerto Plata', 'code' => 'DOPOP', 'km_from_base' => 84, 'active' => true],
            ['name' => 'Manzanillo',  'code' => 'DOMAN', 'km_from_base' => 148, 'active' => false],
        ];
        foreach ($ports as $d) {
            Port::create($d);
        }
    }
}
