<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trucks', function (Blueprint $table) {
            $table->id();
            $table->string('plate')->unique();
            $table->string('vin')->nullable();
            $table->string('make');
            $table->string('model')->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->string('type')->nullable();
            $table->decimal('capacity_tons', 6, 2)->nullable();
            $table->unsignedInteger('odometer_km')->nullable();
            $table->string('driver_name')->nullable();
            $table->enum('status', ['available', 'on_trip', 'in_maintenance', 'out_of_service'])->default('available');
            $table->date('insurance_expires_at')->nullable();
            $table->date('inspection_expires_at')->nullable();
            $table->text('notes')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trucks');
    }
};
