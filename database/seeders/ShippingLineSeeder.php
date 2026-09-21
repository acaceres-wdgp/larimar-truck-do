<?php

namespace Database\Seeders;

use App\Models\ShippingLine;
use Illuminate\Database\Seeder;

class ShippingLineSeeder extends Seeder
{
    public function run(): void
    {
        $lines = [
            ['name' => 'Maersk',         'scac' => 'MAEU', 'contact' => '+1 809 200 4100 · do.ops@maersk.com',  'active' => true],
            ['name' => 'CMA CGM',        'scac' => 'CMDU', 'contact' => '+1 809 200 7788 · sdq@cma-cgm.com',    'active' => true],
            ['name' => 'MSC',            'scac' => 'MSCU', 'contact' => '+1 809 200 3355 · dom-info@msc.com',   'active' => true],
            ['name' => 'Hapag-Lloyd',    'scac' => 'HLCU', 'contact' => '+1 809 200 9120 · sdq@hlag.com',       'active' => true],
            ['name' => 'Evergreen',      'scac' => 'EGLV', 'contact' => '+1 809 200 6644 · sdq@evergreen.com',  'active' => true],
            ['name' => 'Seaboard Marine', 'scac' => 'SMLU', 'contact' => '+1 809 200 1290 · info@seaboard.do',   'active' => false],
        ];
        foreach ($lines as $d) {
            ShippingLine::create($d);
        }
    }
}
