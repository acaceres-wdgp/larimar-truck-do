<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->string('order_number')->nullable()->after('id');
            $table->foreignId('shipping_line_id')->nullable()->after('line')->constrained('shipping_lines')->nullOnDelete();
            $table->string('origin_type')->nullable()->after('to_location');
            $table->unsignedBigInteger('origin_id')->nullable()->after('origin_type');
            $table->string('destination_type')->nullable()->after('origin_id');
            $table->unsignedBigInteger('destination_id')->nullable()->after('destination_type');
            $table->string('container_number')->nullable();
            $table->string('container_size')->nullable()->default("40'");
            $table->string('cargo_type')->nullable()->default('Dry');
            $table->decimal('weight_tons', 6, 2)->nullable();
            $table->decimal('rate', 12, 2)->nullable();
            $table->decimal('fuel_cost', 12, 2)->nullable();
            $table->decimal('toll_cost', 12, 2)->nullable();
            $table->decimal('driver_pay', 12, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropForeign(['shipping_line_id']);
            $table->dropColumn([
                'order_number', 'shipping_line_id', 'origin_type', 'origin_id',
                'destination_type', 'destination_id', 'container_number', 'container_size',
                'cargo_type', 'weight_tons', 'rate', 'fuel_cost', 'toll_cost', 'driver_pay',
            ]);
        });
    }
};
