<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 50)->nullable()->after('email');
            $table->string('job_title', 100)->nullable()->after('phone');
            $table->enum('role', ['administrator', 'operations', 'dispatcher', 'accountant', 'viewer', 'custom'])
                ->default('administrator')->after('job_title');
            $table->enum('status', ['active', 'invited', 'suspended'])
                ->default('active')->after('role');
            $table->timestamp('last_active_at')->nullable()->after('status');
            $table->timestamp('invited_at')->nullable()->after('last_active_at');
            $table->string('invitation_token')->nullable()->unique()->after('invited_at');
            $table->timestamp('invitation_expires_at')->nullable()->after('invitation_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'job_title',
                'role',
                'status',
                'last_active_at',
                'invited_at',
                'invitation_token',
                'invitation_expires_at',
            ]);
        });
    }
};
