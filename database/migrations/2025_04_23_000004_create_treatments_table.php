<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('treatments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('disease_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // 'prevention', 'chemical', 'biological', 'cultural'
            $table->text('description'); // Rekomendasi Tindakan
            $table->string('dosage')->nullable(); // Dosis (angka + keterangan)
            $table->string('dosage_unit')->nullable(); // Satuan dosis (ml/L, kg/ha, gram/L)
            $table->integer('priority')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('treatments');
    }
};
