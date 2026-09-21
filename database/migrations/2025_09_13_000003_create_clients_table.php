<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('kind', ['Company', 'Individual'])->default('Company');
            $table->string('tax_id')->unique();
            $table->string('contact_name')->nullable();
            $table->string('contact_role')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->enum('payment_terms', ['Cash on delivery', '15 days', '30 days', '45 days', '60 days'])->default('30 days');
            $table->decimal('credit_limit', 14, 2)->default(0);
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->string('logo_path')->nullable();
            $table->date('client_since')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
