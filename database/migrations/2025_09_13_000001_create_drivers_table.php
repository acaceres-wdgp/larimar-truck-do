<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('national_id')->nullable();
            $table->string('phone')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->string('license_number')->unique();
            $table->string('license_category')->nullable();
            $table->date('license_expires_at')->nullable();
            $table->foreignId('truck_id')->nullable()->constrained('trucks')->nullOnDelete();
            $table->enum('status', ['available', 'on_trip', 'on_leave', 'inactive'])->default('available');
            $table->text('notes')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
