<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call(BodyTypeSeeder::class);
        $this->call(TruckSeeder::class);
        $this->call(DriverSeeder::class);
        $this->call(ClientSeeder::class);
        $this->call(ShippingLineSeeder::class);
        $this->call(CitySeeder::class);
        $this->call(PortSeeder::class);
        $this->call(TripSeeder::class);
        $this->call(OrderSeeder::class);
        $this->call(InvoiceSeeder::class);
        $this->call(PayrollSeeder::class);
    }
}
