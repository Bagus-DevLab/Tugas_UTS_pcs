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
        Schema::create('detections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('disease_id')->nullable()->constrained()->nullOnDelete();
            $table->string('method'); // 'image' or 'expert_system'
            $table->string('image_path')->nullable();            // VAR 1: Citra Daun
            $table->string('label')->nullable();                 // VAR 2: Label Penyakit
            $table->decimal('confidence', 5, 2)->nullable();     // VAR 3: Tingkat Akurasi (%)
            $table->decimal('temperature', 4, 1)->nullable();    // VAR 4: Suhu (°C)
            $table->timestamp('scanned_at')->nullable();         // VAR 5: Waktu Pemindaian (timestamp)
            $table->integer('scan_duration_ms')->nullable();     // VAR 5: Waktu Pemindaian (durasi ms)
            $table->decimal('latitude', 10, 7)->nullable();      // VAR 6: Titik Koordinat
            $table->decimal('longitude', 10, 7)->nullable();     // VAR 6: Titik Koordinat
            $table->string('connection_status')->default('online'); // VAR 7: Status Koneksi
            // VAR 8 & 9: Rekomendasi Tindakan & Dosis → via relasi disease->treatments
            $table->json('predictions')->nullable();             // Semua prediksi ML
            $table->json('selected_symptoms')->nullable();       // Gejala expert system
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detections');
    }
};
