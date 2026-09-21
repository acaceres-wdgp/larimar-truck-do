<?php

namespace Database\Seeders;

use App\Models\Driver;
use Illuminate\Database\Seeder;

class DriverSeeder extends Seeder
{
    public function run(): void
    {
        $drivers = [
            [
                'first_name' => 'Armando',
                'last_name' => 'Peña',
                'national_id' => '001-1234567-8',
                'phone' => '809-555-0100',
                'emergency_contact' => 'María Peña 809-555-0200',
                'license_number' => 'LIC-AR-001',
                'license_category' => 'Category 04 (heavy)',
                'license_expires_at' => '2026-03-15',
                'status' => 'on_trip',
                'pay_type' => 'percentage',
                'pay_rate' => 30,
            ],
            [
                'first_name' => 'Luis',
                'last_name' => 'Guzmán',
                'national_id' => '001-2345678-9',
                'phone' => '809-555-0110',
                'emergency_contact' => 'Rosa Guzmán 809-555-0211',
                'license_number' => 'LIC-LG-002',
                'license_category' => 'Category 05 (articulated)',
                'license_expires_at' => '2026-07-20',
                'status' => 'on_trip',
                'pay_type' => 'percentage',
                'pay_rate' => 28,
            ],
            [
                'first_name' => 'Ramón',
                'last_name' => 'Díaz',
                'national_id' => '001-3456789-0',
                'phone' => '809-555-0120',
                'emergency_contact' => 'Ana Díaz 809-555-0222',
                'license_number' => 'LIC-RD-003',
                'license_category' => 'Category 04 (heavy)',
                'license_expires_at' => '2025-11-30',
                'status' => 'available',
                'pay_type' => 'per_trip',
                'pay_rate' => 5500,
            ],
            [
                'first_name' => 'José',
                'last_name' => 'Mercedes',
                'national_id' => '001-4567890-1',
                'phone' => '809-555-0130',
                'emergency_contact' => 'Eva Mercedes 809-555-233',
                'license_number' => 'LIC-JM-004',
                'license_category' => 'Category 05 (articulated)',
                'license_expires_at' => '2026-05-18',
                'status' => 'on_trip',
                'pay_type' => 'percentage',
                'pay_rate' => 30,
            ],
            [
                'first_name' => 'Pedro',
                'last_name' => 'Almonte',
                'national_id' => '001-5678901-2',
                'phone' => '809-555-0140',
                'emergency_contact' => 'Luz Almonte 809-555-244',
                'license_number' => 'LIC-PA-005',
                'license_category' => 'Category 04 (heavy)',
                'license_expires_at' => '2026-09-12',
                'status' => 'on_trip',
                'pay_type' => 'percentage',
                'pay_rate' => 28,
            ],
            [
                'first_name' => 'Miguel',
                'last_name' => 'Santos',
                'national_id' => '001-6789012-3',
                'phone' => '809-555-0150',
                'emergency_contact' => 'Iris Santos 809-555-255',
                'license_number' => 'LIC-MS-006',
                'license_category' => 'Category 03 (light truck)',
                'license_expires_at' => '2026-01-25',
                'status' => 'on_leave',
                'pay_type' => 'percentage',
                'pay_rate' => 32,
            ],
            [
                'first_name' => 'Félix',
                'last_name' => 'Rosario',
                'national_id' => '001-7890123-4',
                'phone' => '809-555-0160',
                'emergency_contact' => 'Lena Rosario 809-555-266',
                'license_number' => 'LIC-FR-007',
                'license_category' => 'Category 04 (heavy)',
                'license_expires_at' => '2025-10-05',
                'status' => 'on_trip',
                'pay_type' => 'per_trip',
                'pay_rate' => 4500,
            ],
            [
                'first_name' => 'Carlos',
                'last_name' => 'Bonilla',
                'national_id' => '001-8901234-5',
                'phone' => '809-555-0170',
                'emergency_contact' => 'Clara Bonilla 809-555-277',
                'license_number' => 'LIC-CB-008',
                'license_category' => 'Category 05 (articulated)',
                'license_expires_at' => '2026-11-14',
                'status' => 'available',
                'pay_type' => 'per_trip',
                'pay_rate' => 5000,
            ],
        ];

        foreach ($drivers as $data) {
            Driver::create($data);
        }
    }
}
