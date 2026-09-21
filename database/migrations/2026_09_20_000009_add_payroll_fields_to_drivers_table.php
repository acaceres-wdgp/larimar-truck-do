<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->enum('pay_type', ['per_trip', 'percentage'])->nullable()->after('notes');
            $table->decimal('pay_rate', 10, 2)->nullable()->after('pay_type');
            $table->string('bank_account', 40)->nullable()->after('pay_rate');
        });
    }
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn(['pay_type', 'pay_rate', 'bank_account']);
        });
    }
};
