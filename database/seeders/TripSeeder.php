<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Client;
use App\Models\Driver;
use App\Models\Port;
use App\Models\ShippingLine;
use App\Models\Trip;
use App\Models\Truck;
use Illuminate\Database\Seeder;

class TripSeeder extends Seeder
{
    public function run(): void
    {
        // ── 2025 historical trips ────────────────────────────────────────────
        $trips = [
            ['date' => '2025-08-14', 'type' => 'import', 'client' => 'Maersk DO',          'line' => 'MSC',         'from' => 'SDQ',   'to' => 'HAINA',         'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',      'status' => 'Completed',   'km' => 18, 'rate' => 10000],
            ['date' => '2025-08-22', 'type' => 'export', 'client' => 'Evergreen DR',        'line' => 'Evergreen',   'from' => 'HAINA', 'to' => 'SDQ',           'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',      'status' => 'Completed',   'km' => 18, 'rate' => 10000],
            ['date' => '2025-09-01', 'type' => 'import', 'client' => 'CMA-CGM',             'line' => 'CMA-CGM',     'from' => 'SDQ',   'to' => 'SAN PEDRO',     'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',      'status' => 'On the road', 'km' => 65, 'rate' => 18500],
            ['date' => '2025-08-10', 'type' => 'import', 'client' => 'ONE Shipping',        'line' => 'ONE',         'from' => 'SDQ',   'to' => 'HAINA',         'truck' => 'AM-2044',  'driver_first' => 'Luis',    'driver_last' => 'Guzmán',    'status' => 'Completed',   'km' => 18, 'rate' => 10000],
            ['date' => '2025-08-28', 'type' => 'export', 'client' => 'Tropical Foods',      'line' => 'MSC',         'from' => 'HAINA', 'to' => 'SAN CRISTÓBAL', 'truck' => 'AM-2044',  'driver_first' => 'Luis',    'driver_last' => 'Guzmán',    'status' => 'Completed',   'km' => 42, 'rate' => 15500],
            ['date' => '2025-09-02', 'type' => 'import', 'client' => 'DHL Express',         'line' => 'Hapag-Lloyd', 'from' => 'SDQ',   'to' => 'HAINA',         'truck' => 'AM-2044',  'driver_first' => 'Luis',    'driver_last' => 'Guzmán',    'status' => 'On the road', 'km' => 18, 'rate' => 10000],
            ['date' => '2025-08-05', 'type' => 'export', 'client' => 'Cervecería Nac.',     'line' => 'Evergreen',   'from' => 'SDQ',   'to' => 'PUERTO PLATA',  'truck' => 'AM-2058',  'driver_first' => 'Ramón',   'driver_last' => 'Díaz',      'status' => 'Completed',   'km' => 214, 'rate' => 44500],
            ['date' => '2025-08-18', 'type' => 'import', 'client' => 'IKEA Caribbean',      'line' => 'Maersk',      'from' => 'HAINA', 'to' => 'SDQ',           'truck' => 'AM-2058',  'driver_first' => 'Ramón',   'driver_last' => 'Díaz',      'status' => 'Completed',   'km' => 18, 'rate' => 10000],
            ['date' => '2025-08-12', 'type' => 'import', 'client' => 'Brugal & Co.',        'line' => 'MSC',         'from' => 'SDQ',   'to' => 'HAINA',         'truck' => 'AVR-3030', 'driver_first' => 'José',    'driver_last' => 'Mercedes',  'status' => 'Completed',   'km' => 18, 'rate' => 10000],
            ['date' => '2025-08-25', 'type' => 'export', 'client' => 'Coditel',             'line' => 'CMA-CGM',     'from' => 'SDQ',   'to' => 'MOCA',          'truck' => 'AVR-3030', 'driver_first' => 'José',    'driver_last' => 'Mercedes',  'status' => 'Completed',   'km' => 155, 'rate' => 32000],
            ['date' => '2025-09-03', 'type' => 'import', 'client' => 'Claro DR',            'line' => 'ONE',         'from' => 'SDQ',   'to' => 'HAINA',         'truck' => 'AVR-3030', 'driver_first' => 'José',    'driver_last' => 'Mercedes',  'status' => 'On the road', 'km' => 18, 'rate' => 10000],
            ['date' => '2025-08-08', 'type' => 'import', 'client' => 'Banco Popular',       'line' => 'Evergreen',   'from' => 'SDQ',   'to' => 'SAN PEDRO',     'truck' => 'AVR-3041', 'driver_first' => 'Pedro',   'driver_last' => 'Almonte',   'status' => 'Completed',   'km' => 65, 'rate' => 18500],
            ['date' => '2025-08-20', 'type' => 'export', 'client' => 'EGE Haina',           'line' => 'Hapag-Lloyd', 'from' => 'HAINA', 'to' => 'SDQ',           'truck' => 'AVR-3041', 'driver_first' => 'Pedro',   'driver_last' => 'Almonte',   'status' => 'Completed',   'km' => 18, 'rate' => 10000],
            ['date' => '2025-09-04', 'type' => 'import', 'client' => 'AES Dominicana',      'line' => 'MSC',         'from' => 'SDQ',   'to' => 'HAINA',         'truck' => 'AVR-3041', 'driver_first' => 'Pedro',   'driver_last' => 'Almonte',   'status' => 'Delayed',     'km' => 18, 'rate' => 10000],
            ['date' => '2025-08-03', 'type' => 'export', 'client' => 'PUCMM',               'line' => 'CMA-CGM',     'from' => 'SDQ',   'to' => 'HAINA',         'truck' => 'TL-1185',  'driver_first' => 'Miguel',  'driver_last' => 'Santos',    'status' => 'Completed',   'km' => 18, 'rate' => 10000],
            ['date' => '2025-08-15', 'type' => 'import', 'client' => 'UNPHU',               'line' => 'Maersk',      'from' => 'HAINA', 'to' => 'SDQ',           'truck' => 'TL-1185',  'driver_first' => 'Miguel',  'driver_last' => 'Santos',    'status' => 'Completed',   'km' => 18, 'rate' => 10000],
            ['date' => '2025-08-07', 'type' => 'import', 'client' => 'Nestle DR',           'line' => 'MSC',         'from' => 'SDQ',   'to' => 'HAINA',         'truck' => 'TL-1190',  'driver_first' => 'Félix',   'driver_last' => 'Rosario',   'status' => 'Completed',   'km' => 18, 'rate' => 10000],
            ['date' => '2025-08-19', 'type' => 'export', 'client' => 'Unilever DR',         'line' => 'Evergreen',   'from' => 'SDQ',   'to' => 'SAN CRISTÓBAL', 'truck' => 'TL-1190',  'driver_first' => 'Félix',   'driver_last' => 'Rosario',   'status' => 'Completed',   'km' => 42, 'rate' => 15500],
            ['date' => '2025-09-01', 'type' => 'import', 'client' => 'P&G Caribbean',       'line' => 'CMA-CGM',     'from' => 'SDQ',   'to' => 'HAINA',         'truck' => 'TL-1190',  'driver_first' => 'Félix',   'driver_last' => 'Rosario',   'status' => 'Paused',      'km' => 18, 'rate' => 10000],
            ['date' => '2025-08-06', 'type' => 'export', 'client' => 'General Motors DR',   'line' => 'ONE',         'from' => 'HAINA', 'to' => 'SDQ',           'truck' => 'TL-1202',  'driver_first' => 'Carlos',  'driver_last' => 'Bonilla',   'status' => 'Completed',   'km' => 18, 'rate' => 10000],
            ['date' => '2025-08-17', 'type' => 'import', 'client' => 'Toyota DR',           'line' => 'Hapag-Lloyd', 'from' => 'SDQ',   'to' => 'HAINA',         'truck' => 'TL-1202',  'driver_first' => 'Carlos',  'driver_last' => 'Bonilla',   'status' => 'Completed',   'km' => 18, 'rate' => 10000],
            ['date' => '2025-08-30', 'type' => 'export', 'client' => 'Honda DR',            'line' => 'Maersk',      'from' => 'HAINA', 'to' => 'SDQ',           'truck' => 'TL-1202',  'driver_first' => 'Carlos',  'driver_last' => 'Bonilla',   'status' => 'Completed',   'km' => 18, 'rate' => 10000],
        ];

        $this->insertTrips($trips);

        // ── 2026 current trips (recent + today/tomorrow) ─────────────────────
        $clientTrips = [
            ['date' => '2026-09-11', 'type' => 'import', 'client' => 'Imagine SRL',              'line' => 'Maersk',      'from' => 'Caucedo',      'to' => 'Santiago',  'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',     'status' => 'On the road', 'km' => 212, 'rate' => 44000],
            ['date' => '2026-09-11', 'type' => 'export', 'client' => 'Cementos Cibao',           'line' => 'CMA CGM',     'from' => 'La Vega',      'to' => 'Caucedo',   'truck' => 'AVR-3041', 'driver_first' => 'Miguel',  'driver_last' => 'Santos',   'status' => 'On the road', 'km' => 186, 'rate' => 38500],
            ['date' => '2026-09-10', 'type' => 'import', 'client' => 'Grupo Ramos',              'line' => 'MSC',         'from' => 'Caucedo',      'to' => 'La Vega',   'truck' => 'TL-1190',  'driver_first' => 'Pedro',   'driver_last' => 'Almonte',  'status' => 'Completed',   'km' => 178, 'rate' => 37000],
            ['date' => '2026-09-10', 'type' => 'export', 'client' => 'Tabacalera del Norte',     'line' => 'Maersk',      'from' => 'Santiago',     'to' => 'Caucedo',   'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',     'status' => 'Completed',   'km' => 214, 'rate' => 44500],
            ['date' => '2026-09-09', 'type' => 'import', 'client' => 'América Internacional',    'line' => 'CMA CGM',     'from' => 'Río Haina',    'to' => 'Santiago',  'truck' => 'AVR-3030', 'driver_first' => 'Luis',    'driver_last' => 'Guzmán',   'status' => 'Completed',   'km' => 196, 'rate' => 40500],
            ['date' => '2026-09-09', 'type' => 'import', 'client' => 'Agroindustrial del Cibao', 'line' => 'Maersk',      'from' => 'Río Haina',    'to' => 'Bonao',     'truck' => 'AM-2044',  'driver_first' => 'José',    'driver_last' => 'Mercedes', 'status' => 'Delayed',     'km' => 121, 'rate' => 26000],
            ['date' => '2026-09-08', 'type' => 'export', 'client' => 'Industria Blanca SRL',     'line' => 'Hapag-Lloyd', 'from' => 'Santiago',     'to' => 'Caucedo',   'truck' => 'TL-1185',  'driver_first' => 'Ramón',   'driver_last' => 'Díaz',     'status' => 'Completed',   'km' => 208, 'rate' => 43000],
            ['date' => '2026-09-08', 'type' => 'import', 'client' => 'Ferretería Ochoa',         'line' => 'Evergreen',   'from' => 'Puerto Plata', 'to' => 'Santiago',  'truck' => 'TL-1202',  'driver_first' => 'Félix',   'driver_last' => 'Rosario',  'status' => 'Completed',   'km' => 84, 'rate' => 21500],
            ['date' => '2026-09-05', 'type' => 'import', 'client' => 'Imagine SRL',              'line' => 'Maersk',      'from' => 'Caucedo',      'to' => 'Santiago',  'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',     'status' => 'Completed',   'km' => 212, 'rate' => 44000],
            ['date' => '2026-09-04', 'type' => 'import', 'client' => 'Distribuidora Corripio',   'line' => 'Hapag-Lloyd', 'from' => 'Caucedo',      'to' => 'Santiago',  'truck' => 'AVR-3030', 'driver_first' => 'Luis',    'driver_last' => 'Guzmán',   'status' => 'Completed',   'km' => 214, 'rate' => 44500],
            ['date' => '2026-09-02', 'type' => 'import', 'client' => 'Grupo Ramos',              'line' => 'MSC',         'from' => 'Caucedo',      'to' => 'Santiago',  'truck' => 'AVR-3041', 'driver_first' => 'Miguel',  'driver_last' => 'Santos',   'status' => 'Completed',   'km' => 214, 'rate' => 44500],
            ['date' => '2026-09-02', 'type' => 'export', 'client' => 'Cementos Cibao',           'line' => 'CMA CGM',     'from' => 'La Vega',      'to' => 'Caucedo',   'truck' => 'AM-2058',  'driver_first' => 'Carlos',  'driver_last' => 'Bonilla',  'status' => 'Completed',   'km' => 186, 'rate' => 38500],
            ['date' => '2026-09-01', 'type' => 'import', 'client' => 'Ferretería Ochoa',         'line' => 'Evergreen',   'from' => 'Puerto Plata', 'to' => 'Santiago',  'truck' => 'TL-1202',  'driver_first' => 'Félix',   'driver_last' => 'Rosario',  'status' => 'Completed',   'km' => 84, 'rate' => 21500],
            ['date' => '2026-08-29', 'type' => 'import', 'client' => 'Imagine SRL',              'line' => 'Maersk',      'from' => 'Caucedo',      'to' => 'Santiago',  'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',     'status' => 'Completed',   'km' => 212, 'rate' => 44000],
            ['date' => '2026-08-29', 'type' => 'export', 'client' => 'Tabacalera del Norte',     'line' => 'Maersk',      'from' => 'Santiago',     'to' => 'Caucedo',   'truck' => 'AVR-3030', 'driver_first' => 'Luis',    'driver_last' => 'Guzmán',   'status' => 'Completed',   'km' => 214, 'rate' => 44500],
            ['date' => '2026-08-28', 'type' => 'import', 'client' => 'Agroindustrial del Cibao', 'line' => 'Maersk',      'from' => 'Río Haina',    'to' => 'Bonao',     'truck' => 'AM-2044',  'driver_first' => 'José',    'driver_last' => 'Mercedes', 'status' => 'Completed',   'km' => 121, 'rate' => 26000],
            ['date' => '2026-08-28', 'type' => 'export', 'client' => 'Industria Blanca SRL',     'line' => 'Hapag-Lloyd', 'from' => 'Santiago',     'to' => 'Caucedo',   'truck' => 'TL-1190',  'driver_first' => 'Pedro',   'driver_last' => 'Almonte',  'status' => 'Completed',   'km' => 208, 'rate' => 43000],
            ['date' => '2026-08-27', 'type' => 'import', 'client' => 'Distribuidora Corripio',   'line' => 'Hapag-Lloyd', 'from' => 'Caucedo',      'to' => 'Santiago',  'truck' => 'AM-2044',  'driver_first' => 'José',    'driver_last' => 'Mercedes', 'status' => 'Completed',   'km' => 214, 'rate' => 44500],
        ];

        $this->insertTrips($clientTrips);

        // ── April – August 2026 historical (for the 6-month chart) ──────────
        $historicalTrips = [
            // April 2026 — total ≈ RD$230,500
            ['date' => '2026-04-03', 'type' => 'import', 'client' => 'Imagine SRL',              'line' => 'Maersk',      'from' => 'Caucedo',      'to' => 'Santiago', 'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',     'status' => 'Completed', 'km' => 212, 'rate' => 44000],
            ['date' => '2026-04-07', 'type' => 'export', 'client' => 'Tabacalera del Norte',     'line' => 'Maersk',      'from' => 'Santiago',     'to' => 'Caucedo',  'truck' => 'AVR-3030', 'driver_first' => 'Luis',    'driver_last' => 'Guzmán',   'status' => 'Completed', 'km' => 214, 'rate' => 44500],
            ['date' => '2026-04-10', 'type' => 'import', 'client' => 'Ferretería Ochoa',         'line' => 'Evergreen',   'from' => 'Puerto Plata', 'to' => 'Santiago', 'truck' => 'TL-1202',  'driver_first' => 'Félix',   'driver_last' => 'Rosario',  'status' => 'Completed', 'km' => 84, 'rate' => 21500],
            ['date' => '2026-04-15', 'type' => 'import', 'client' => 'Grupo Ramos',              'line' => 'MSC',         'from' => 'Caucedo',      'to' => 'La Vega',  'truck' => 'TL-1190',  'driver_first' => 'Pedro',   'driver_last' => 'Almonte',  'status' => 'Completed', 'km' => 178, 'rate' => 37000],
            ['date' => '2026-04-22', 'type' => 'export', 'client' => 'Industria Blanca SRL',     'line' => 'Hapag-Lloyd', 'from' => 'Santiago',     'to' => 'Caucedo',  'truck' => 'TL-1185',  'driver_first' => 'Ramón',   'driver_last' => 'Díaz',     'status' => 'Completed', 'km' => 208, 'rate' => 43000],
            ['date' => '2026-04-28', 'type' => 'import', 'client' => 'América Internacional',    'line' => 'CMA CGM',     'from' => 'Río Haina',    'to' => 'Santiago', 'truck' => 'AM-2044',  'driver_first' => 'José',    'driver_last' => 'Mercedes', 'status' => 'Completed', 'km' => 196, 'rate' => 40500],

            // May 2026 — total ≈ RD$299,000
            ['date' => '2026-05-02', 'type' => 'import', 'client' => 'Imagine SRL',              'line' => 'Maersk',      'from' => 'Caucedo',      'to' => 'Santiago', 'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',     'status' => 'Completed', 'km' => 212, 'rate' => 44000],
            ['date' => '2026-05-06', 'type' => 'export', 'client' => 'Cementos Cibao',           'line' => 'CMA CGM',     'from' => 'La Vega',      'to' => 'Caucedo',  'truck' => 'AVR-3041', 'driver_first' => 'Miguel',  'driver_last' => 'Santos',   'status' => 'Completed', 'km' => 186, 'rate' => 38500],
            ['date' => '2026-05-10', 'type' => 'import', 'client' => 'Distribuidora Corripio',   'line' => 'Hapag-Lloyd', 'from' => 'Caucedo',      'to' => 'Santiago', 'truck' => 'AVR-3030', 'driver_first' => 'Luis',    'driver_last' => 'Guzmán',   'status' => 'Completed', 'km' => 214, 'rate' => 44500],
            ['date' => '2026-05-14', 'type' => 'export', 'client' => 'Tabacalera del Norte',     'line' => 'Maersk',      'from' => 'Santiago',     'to' => 'Caucedo',  'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',     'status' => 'Completed', 'km' => 214, 'rate' => 44500],
            ['date' => '2026-05-18', 'type' => 'import', 'client' => 'Agroindustrial del Cibao', 'line' => 'Maersk',      'from' => 'Río Haina',    'to' => 'Bonao',    'truck' => 'AM-2044',  'driver_first' => 'José',    'driver_last' => 'Mercedes', 'status' => 'Completed', 'km' => 121, 'rate' => 26000],
            ['date' => '2026-05-22', 'type' => 'export', 'client' => 'Industria Blanca SRL',     'line' => 'Hapag-Lloyd', 'from' => 'Santiago',     'to' => 'Caucedo',  'truck' => 'TL-1185',  'driver_first' => 'Ramón',   'driver_last' => 'Díaz',     'status' => 'Completed', 'km' => 208, 'rate' => 43000],
            ['date' => '2026-05-27', 'type' => 'import', 'client' => 'Ferretería Ochoa',         'line' => 'Evergreen',   'from' => 'Puerto Plata', 'to' => 'Santiago', 'truck' => 'TL-1202',  'driver_first' => 'Félix',   'driver_last' => 'Rosario',  'status' => 'Completed', 'km' => 84, 'rate' => 21500],
            ['date' => '2026-05-30', 'type' => 'import', 'client' => 'Grupo Ramos',              'line' => 'MSC',         'from' => 'Caucedo',      'to' => 'La Vega',  'truck' => 'TL-1190',  'driver_first' => 'Pedro',   'driver_last' => 'Almonte',  'status' => 'Completed', 'km' => 178, 'rate' => 37000],

            // June 2026 — total ≈ RD$339,500
            ['date' => '2026-06-02', 'type' => 'import', 'client' => 'Imagine SRL',              'line' => 'Maersk',      'from' => 'Caucedo',      'to' => 'Santiago', 'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',     'status' => 'Completed', 'km' => 212, 'rate' => 44000],
            ['date' => '2026-06-05', 'type' => 'export', 'client' => 'Cementos Cibao',           'line' => 'CMA CGM',     'from' => 'La Vega',      'to' => 'Caucedo',  'truck' => 'AVR-3041', 'driver_first' => 'Miguel',  'driver_last' => 'Santos',   'status' => 'Completed', 'km' => 186, 'rate' => 38500],
            ['date' => '2026-06-09', 'type' => 'import', 'client' => 'América Internacional',    'line' => 'CMA CGM',     'from' => 'Río Haina',    'to' => 'Santiago', 'truck' => 'AVR-3030', 'driver_first' => 'Luis',    'driver_last' => 'Guzmán',   'status' => 'Completed', 'km' => 196, 'rate' => 40500],
            ['date' => '2026-06-12', 'type' => 'import', 'client' => 'Distribuidora Corripio',   'line' => 'Hapag-Lloyd', 'from' => 'Caucedo',      'to' => 'Santiago', 'truck' => 'AM-2044',  'driver_first' => 'José',    'driver_last' => 'Mercedes', 'status' => 'Completed', 'km' => 214, 'rate' => 44500],
            ['date' => '2026-06-16', 'type' => 'export', 'client' => 'Tabacalera del Norte',     'line' => 'Maersk',      'from' => 'Santiago',     'to' => 'Caucedo',  'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',     'status' => 'Completed', 'km' => 214, 'rate' => 44500],
            ['date' => '2026-06-19', 'type' => 'import', 'client' => 'Grupo Ramos',              'line' => 'MSC',         'from' => 'Caucedo',      'to' => 'La Vega',  'truck' => 'TL-1190',  'driver_first' => 'Pedro',   'driver_last' => 'Almonte',  'status' => 'Completed', 'km' => 178, 'rate' => 37000],
            ['date' => '2026-06-23', 'type' => 'export', 'client' => 'Industria Blanca SRL',     'line' => 'Hapag-Lloyd', 'from' => 'Santiago',     'to' => 'Caucedo',  'truck' => 'TL-1185',  'driver_first' => 'Ramón',   'driver_last' => 'Díaz',     'status' => 'Completed', 'km' => 208, 'rate' => 43000],
            ['date' => '2026-06-26', 'type' => 'import', 'client' => 'Ferretería Ochoa',         'line' => 'Evergreen',   'from' => 'Puerto Plata', 'to' => 'Santiago', 'truck' => 'TL-1202',  'driver_first' => 'Félix',   'driver_last' => 'Rosario',  'status' => 'Completed', 'km' => 84, 'rate' => 21500],
            ['date' => '2026-06-29', 'type' => 'import', 'client' => 'Agroindustrial del Cibao', 'line' => 'Maersk',      'from' => 'Río Haina',    'to' => 'Bonao',    'truck' => 'AM-2058',  'driver_first' => 'Carlos',  'driver_last' => 'Bonilla',  'status' => 'Completed', 'km' => 121, 'rate' => 26000],

            // July 2026 — total ≈ RD$384,000
            ['date' => '2026-07-01', 'type' => 'import', 'client' => 'Imagine SRL',              'line' => 'Maersk',      'from' => 'Caucedo',      'to' => 'Santiago', 'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',     'status' => 'Completed', 'km' => 212, 'rate' => 44000],
            ['date' => '2026-07-04', 'type' => 'export', 'client' => 'Cementos Cibao',           'line' => 'CMA CGM',     'from' => 'La Vega',      'to' => 'Caucedo',  'truck' => 'AVR-3041', 'driver_first' => 'Miguel',  'driver_last' => 'Santos',   'status' => 'Completed', 'km' => 186, 'rate' => 38500],
            ['date' => '2026-07-07', 'type' => 'import', 'client' => 'América Internacional',    'line' => 'CMA CGM',     'from' => 'Río Haina',    'to' => 'Santiago', 'truck' => 'AVR-3030', 'driver_first' => 'Luis',    'driver_last' => 'Guzmán',   'status' => 'Completed', 'km' => 196, 'rate' => 40500],
            ['date' => '2026-07-10', 'type' => 'export', 'client' => 'Tabacalera del Norte',     'line' => 'Maersk',      'from' => 'Santiago',     'to' => 'Caucedo',  'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',     'status' => 'Completed', 'km' => 214, 'rate' => 44500],
            ['date' => '2026-07-14', 'type' => 'import', 'client' => 'Distribuidora Corripio',   'line' => 'Hapag-Lloyd', 'from' => 'Caucedo',      'to' => 'Santiago', 'truck' => 'AM-2044',  'driver_first' => 'José',    'driver_last' => 'Mercedes', 'status' => 'Completed', 'km' => 214, 'rate' => 44500],
            ['date' => '2026-07-17', 'type' => 'import', 'client' => 'Grupo Ramos',              'line' => 'MSC',         'from' => 'Caucedo',      'to' => 'La Vega',  'truck' => 'TL-1190',  'driver_first' => 'Pedro',   'driver_last' => 'Almonte',  'status' => 'Completed', 'km' => 178, 'rate' => 37000],
            ['date' => '2026-07-21', 'type' => 'export', 'client' => 'Industria Blanca SRL',     'line' => 'Hapag-Lloyd', 'from' => 'Santiago',     'to' => 'Caucedo',  'truck' => 'TL-1185',  'driver_first' => 'Ramón',   'driver_last' => 'Díaz',     'status' => 'Completed', 'km' => 208, 'rate' => 43000],
            ['date' => '2026-07-24', 'type' => 'import', 'client' => 'Ferretería Ochoa',         'line' => 'Evergreen',   'from' => 'Puerto Plata', 'to' => 'Santiago', 'truck' => 'TL-1202',  'driver_first' => 'Félix',   'driver_last' => 'Rosario',  'status' => 'Completed', 'km' => 84, 'rate' => 21500],
            ['date' => '2026-07-28', 'type' => 'import', 'client' => 'Agroindustrial del Cibao', 'line' => 'Maersk',      'from' => 'Río Haina',    'to' => 'Bonao',    'truck' => 'AM-2058',  'driver_first' => 'Carlos',  'driver_last' => 'Bonilla',  'status' => 'Completed', 'km' => 121, 'rate' => 26000],
            ['date' => '2026-07-31', 'type' => 'export', 'client' => 'Tabacalera del Norte',     'line' => 'Maersk',      'from' => 'Santiago',     'to' => 'Caucedo',  'truck' => 'AVR-3030', 'driver_first' => 'Luis',    'driver_last' => 'Guzmán',   'status' => 'Completed', 'km' => 214, 'rate' => 44500],

            // Extra August 2026 — complement existing 5, total Aug ≈ RD$428,000
            ['date' => '2026-08-05', 'type' => 'import', 'client' => 'Imagine SRL',              'line' => 'Maersk',      'from' => 'Caucedo',      'to' => 'Santiago', 'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',     'status' => 'Completed', 'km' => 212, 'rate' => 44000],
            ['date' => '2026-08-10', 'type' => 'export', 'client' => 'Cementos Cibao',           'line' => 'CMA CGM',     'from' => 'La Vega',      'to' => 'Caucedo',  'truck' => 'AVR-3041', 'driver_first' => 'Miguel',  'driver_last' => 'Santos',   'status' => 'Completed', 'km' => 186, 'rate' => 38500],
            ['date' => '2026-08-13', 'type' => 'import', 'client' => 'América Internacional',    'line' => 'CMA CGM',     'from' => 'Río Haina',    'to' => 'Santiago', 'truck' => 'AVR-3030', 'driver_first' => 'Luis',    'driver_last' => 'Guzmán',   'status' => 'Completed', 'km' => 196, 'rate' => 40500],
            ['date' => '2026-08-17', 'type' => 'import', 'client' => 'Grupo Ramos',              'line' => 'MSC',         'from' => 'Caucedo',      'to' => 'La Vega',  'truck' => 'TL-1190',  'driver_first' => 'Pedro',   'driver_last' => 'Almonte',  'status' => 'Completed', 'km' => 178, 'rate' => 37000],
            ['date' => '2026-08-20', 'type' => 'import', 'client' => 'Ferretería Ochoa',         'line' => 'Evergreen',   'from' => 'Puerto Plata', 'to' => 'Santiago', 'truck' => 'TL-1202',  'driver_first' => 'Félix',   'driver_last' => 'Rosario',  'status' => 'Completed', 'km' => 84, 'rate' => 21500],
            ['date' => '2026-08-23', 'type' => 'export', 'client' => 'Tabacalera del Norte',     'line' => 'Maersk',      'from' => 'Santiago',     'to' => 'Caucedo',  'truck' => 'AM-2044',  'driver_first' => 'José',    'driver_last' => 'Mercedes', 'status' => 'Completed', 'km' => 214, 'rate' => 44500],
        ];

        $this->insertTrips($historicalTrips);

        // ── Today & tomorrow (dynamic — always current for the board) ────────
        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();

        $boardTrips = [
            ['date' => $today,    'type' => 'import', 'client' => 'Imagine SRL',              'line' => 'Maersk',      'from' => 'Caucedo',      'to' => 'Santiago',  'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',     'status' => 'On the road', 'km' => 212, 'rate' => 44000],
            ['date' => $today,    'type' => 'import', 'client' => 'América Internacional',    'line' => 'CMA CGM',     'from' => 'Río Haina',    'to' => 'Santiago',  'truck' => 'AVR-3030', 'driver_first' => 'Luis',    'driver_last' => 'Guzmán',   'status' => 'At port',     'km' => 196, 'rate' => 40500],
            ['date' => $today,    'type' => 'import', 'client' => 'Grupo Ramos',              'line' => 'MSC',         'from' => 'Caucedo',      'to' => 'La Vega',   'truck' => 'TL-1190',  'driver_first' => 'Pedro',   'driver_last' => 'Almonte',  'status' => 'On the road', 'km' => 178, 'rate' => 37000],
            ['date' => $today,    'type' => 'import', 'client' => 'Distribuidora Corripio',   'line' => 'Hapag-Lloyd', 'from' => 'Caucedo',      'to' => 'Santiago',  'truck' => 'AM-2058',  'driver_first' => 'Carlos',  'driver_last' => 'Bonilla',  'status' => 'Scheduled',   'km' => 214, 'rate' => 44500],
            ['date' => $today,    'type' => 'import', 'client' => 'Ferretería Ochoa',         'line' => 'Evergreen',   'from' => 'Puerto Plata', 'to' => 'Santiago',  'truck' => 'TL-1202',  'driver_first' => 'Félix',   'driver_last' => 'Rosario',  'status' => 'Paused',      'km' => 84,  'rate' => 21500],
            ['date' => $today,    'type' => 'import', 'client' => 'Agroindustrial del Cibao', 'line' => 'Maersk',      'from' => 'Río Haina',    'to' => 'Bonao',     'truck' => 'AM-2044',  'driver_first' => 'José',    'driver_last' => 'Mercedes', 'status' => 'Delayed',     'km' => 121, 'rate' => 26000],
            ['date' => $today,    'type' => 'export', 'client' => 'Industria Blanca SRL',     'line' => 'Hapag-Lloyd', 'from' => 'Santiago',     'to' => 'Caucedo',   'truck' => 'TL-1185',  'driver_first' => 'Ramón',   'driver_last' => 'Díaz',     'status' => 'Scheduled',   'km' => 208, 'rate' => 43000],
            ['date' => $today,    'type' => 'export', 'client' => 'Cementos Cibao',           'line' => 'CMA CGM',     'from' => 'La Vega',      'to' => 'Caucedo',   'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',     'status' => 'Scheduled',   'km' => 186, 'rate' => 38500],
            ['date' => $today,    'type' => 'export', 'client' => 'Tabacalera del Norte',     'line' => 'Maersk',      'from' => 'Santiago',     'to' => 'Caucedo',   'truck' => 'TL-1190',  'driver_first' => 'Pedro',   'driver_last' => 'Almonte',  'status' => 'Scheduled',   'km' => 214, 'rate' => 44500],
            ['date' => $today,    'type' => 'export', 'client' => 'Cementos Cibao',           'line' => 'CMA CGM',     'from' => 'La Vega',      'to' => 'Caucedo',   'truck' => 'AVR-3041', 'driver_first' => 'Miguel',  'driver_last' => 'Santos',   'status' => 'On the road', 'km' => 186, 'rate' => 38500],
            ['date' => $today,    'type' => 'export', 'client' => 'Frutas del Valle',         'line' => 'Evergreen',   'from' => 'Bonao',        'to' => 'Río Haina', 'truck' => 'AVR-3030', 'driver_first' => 'Luis',    'driver_last' => 'Guzmán',   'status' => 'Completed',   'km' => 108, 'rate' => 27000],
            ['date' => $tomorrow, 'type' => 'import', 'client' => 'Grupo Ramos',              'line' => 'MSC',         'from' => 'Caucedo',      'to' => 'Santiago',  'truck' => 'AM-2021',  'driver_first' => 'Armando', 'driver_last' => 'Peña',     'status' => 'Scheduled',   'km' => 212, 'rate' => 44000],
            ['date' => $tomorrow, 'type' => 'import', 'client' => 'Plaza Lama',               'line' => 'Maersk',      'from' => 'Río Haina',    'to' => 'Moca',      'truck' => 'AM-2058',  'driver_first' => 'Carlos',  'driver_last' => 'Bonilla',  'status' => 'Scheduled',   'km' => 168, 'rate' => 35000],
            ['date' => $tomorrow, 'type' => 'export', 'client' => 'Tabacalera del Norte',     'line' => 'Maersk',      'from' => 'Santiago',     'to' => 'Caucedo',   'truck' => 'AVR-3030', 'driver_first' => 'Luis',    'driver_last' => 'Guzmán',   'status' => 'Scheduled',   'km' => 214, 'rate' => 44500],
            ['date' => $tomorrow, 'type' => 'export', 'client' => 'Industria Blanca SRL',     'line' => 'Hapag-Lloyd', 'from' => 'Moca',         'to' => 'Río Haina', 'truck' => 'TL-1190',  'driver_first' => 'Pedro',   'driver_last' => 'Almonte',  'status' => 'Scheduled',   'km' => 152, 'rate' => 32000],
        ];

        $this->insertTrips($boardTrips);
    }

    private function insertTrips(array $trips): void
    {
        foreach ($trips as $data) {
            $truck = Truck::where('plate', $data['truck'])->first();
            $driver = Driver::where('first_name', $data['driver_first'])
                ->where('last_name', $data['driver_last'])
                ->first();
            $client = Client::where('name', $data['client'])->first();
            $shippingLine = ShippingLine::where('name', $data['line'])->first();

            // Resolve origin: try port name first, then city name
            $originPort = Port::where('name', $data['from'])->first();
            $originCity = $originPort ? null : City::where('name', $data['from'])->first();
            $originType = $originPort ? 'port' : ($originCity ? 'city' : null);
            $originId = $originPort?->id ?? $originCity?->id;

            // Resolve destination: try port name first, then city name
            $destPort = Port::where('name', $data['to'])->first();
            $destCity = $destPort ? null : City::where('name', $data['to'])->first();
            $destType = $destPort ? 'port' : ($destCity ? 'city' : null);
            $destId = $destPort?->id ?? $destCity?->id;

            Trip::create([
                'date' => $data['date'],
                'type' => $data['type'],
                'client' => $data['client'],
                'client_id' => $client?->id,
                'line' => $data['line'],
                'shipping_line_id' => $shippingLine?->id,
                'from_location' => $data['from'],
                'to_location' => $data['to'],
                'origin_type' => $originType,
                'origin_id' => $originId,
                'destination_type' => $destType,
                'destination_id' => $destId,
                'truck_id' => $truck?->id,
                'driver_id' => $driver?->id,
                'status' => $data['status'],
                'km' => $data['km'],
                'rate' => $data['rate'],
            ]);
        }
    }
}
