<?php

namespace Database\Seeders;

use App\Models\Truck;
use Illuminate\Database\Seeder;

class TruckSeeder extends Seeder
{
    public function run(): void
    {
        $trucks = [
            ['plate' => 'AM-2021', 'make' => 'Freightliner', 'model' => 'Cascadia 126', 'year' => 2019, 'type' => 'Tractor unit', 'capacity_tons' => 30, 'odometer_km' => 412500, 'vin' => '1FUJGLDR7CLBP8834', 'status' => 'on_trip', 'insurance_expires_at' => '2026-11-30', 'inspection_expires_at' => '2026-10-15', 'notes' => null],
            ['plate' => 'AM-2044', 'make' => 'International', 'model' => 'LT625', 'year' => 2020, 'type' => 'Tractor unit', 'capacity_tons' => 32, 'odometer_km' => 298100, 'vin' => '3HSDJAPR4LN123998', 'status' => 'on_trip', 'insurance_expires_at' => '2027-02-14', 'inspection_expires_at' => '2026-12-02', 'notes' => null],
            ['plate' => 'AM-2058', 'make' => 'Volvo', 'model' => 'VNL 760', 'year' => 2021, 'type' => 'Tractor unit', 'capacity_tons' => 32, 'odometer_km' => 186400, 'vin' => '4V4NC9EH0MN220117', 'status' => 'available', 'insurance_expires_at' => '2027-01-08', 'inspection_expires_at' => '2027-01-20', 'notes' => null],
            ['plate' => 'AVR-3030', 'make' => 'Mack', 'model' => 'Anthem 64T', 'year' => 2018, 'type' => 'Chassis (container)', 'capacity_tons' => 28, 'odometer_km' => 523900, 'vin' => '1M1AN07Y8JM019442', 'status' => 'on_trip', 'insurance_expires_at' => '2026-09-28', 'inspection_expires_at' => '2026-11-11', 'notes' => 'Air-ride suspension.'],
            ['plate' => 'AVR-3041', 'make' => 'Kenworth', 'model' => 'T680', 'year' => 2020, 'type' => 'Chassis (container)', 'capacity_tons' => 30, 'odometer_km' => 341200, 'vin' => '1XKYDP9X5LJ287310', 'status' => 'on_trip', 'insurance_expires_at' => '2027-03-05', 'inspection_expires_at' => '2026-12-19', 'notes' => null],
            ['plate' => 'TL-1185', 'make' => 'Scania', 'model' => 'R 450', 'year' => 2017, 'type' => 'Flatbed', 'capacity_tons' => 26, 'odometer_km' => 611800, 'vin' => 'YS2R4X20005412886', 'status' => 'in_maintenance', 'insurance_expires_at' => '2026-10-02', 'inspection_expires_at' => '2026-09-30', 'notes' => 'Clutch replacement scheduled.'],
            ['plate' => 'TL-1190', 'make' => 'Freightliner', 'model' => 'M2 112', 'year' => 2016, 'type' => 'Rigid box', 'capacity_tons' => 18, 'odometer_km' => 702450, 'vin' => '1FVHCYDT7GHHS9211', 'status' => 'on_trip', 'insurance_expires_at' => '2026-12-22', 'inspection_expires_at' => '2027-02-08', 'notes' => null],
            ['plate' => 'TL-1202', 'make' => 'Hino', 'model' => '500 FG', 'year' => 2022, 'type' => 'Rigid box', 'capacity_tons' => 14, 'odometer_km' => 96300, 'vin' => 'JHDFG8JTU3XX10455', 'status' => 'available', 'insurance_expires_at' => '2027-04-17', 'inspection_expires_at' => '2027-03-11', 'notes' => null],
        ];

        foreach ($trucks as $data) {
            Truck::create($data);
        }
    }
}
