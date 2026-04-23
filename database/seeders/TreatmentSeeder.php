<?php

namespace Database\Seeders;

use App\Models\Disease;
use App\Models\Treatment;
use Illuminate\Database\Seeder;

class TreatmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $treatments = [
            // ===== BLAST =====
            'blast' => [
                // Chemical
                ['type' => 'chemical', 'description' => 'Aplikasi fungisida Tricyclazole 75 WP secara preventif atau saat gejala awal muncul', 'dosage' => '0.6', 'dosage_unit' => 'gram/L', 'priority' => 1],
                ['type' => 'chemical', 'description' => 'Aplikasi fungisida Isoprothiolane 40 EC untuk pengendalian blast daun dan leher malai', 'dosage' => '2', 'dosage_unit' => 'ml/L', 'priority' => 2],
                ['type' => 'chemical', 'description' => 'Penyemprotan fungisida Kasugamycin 2% SL pada fase vegetatif', 'dosage' => '1.5', 'dosage_unit' => 'ml/L', 'priority' => 3],
                // Prevention
                ['type' => 'prevention', 'description' => 'Gunakan varietas tahan blast seperti Inpari 33, Ciherang, atau varietas lokal yang tahan', 'dosage' => null, 'dosage_unit' => null, 'priority' => 1],
                ['type' => 'prevention', 'description' => 'Atur jarak tanam 25x25 cm untuk sirkulasi udara yang baik', 'dosage' => null, 'dosage_unit' => null, 'priority' => 2],
                ['type' => 'prevention', 'description' => 'Kurangi pemupukan nitrogen berlebihan, gunakan dosis sesuai rekomendasi', 'dosage' => '250', 'dosage_unit' => 'kg urea/ha (maksimal)', 'priority' => 3],
                // Biological
                ['type' => 'biological', 'description' => 'Aplikasi agen hayati Trichoderma sp. sebagai biofungisida', 'dosage' => '5', 'dosage_unit' => 'gram/L', 'priority' => 1],
                ['type' => 'biological', 'description' => 'Penyemprotan Bacillus subtilis sebagai agen pengendali hayati', 'dosage' => '3', 'dosage_unit' => 'ml/L', 'priority' => 2],
                // Cultural
                ['type' => 'cultural', 'description' => 'Sanitasi lahan dengan membersihkan sisa-sisa tanaman yang terinfeksi setelah panen', 'dosage' => null, 'dosage_unit' => null, 'priority' => 1],
                ['type' => 'cultural', 'description' => 'Lakukan pergiliran varietas setiap 2-3 musim tanam', 'dosage' => null, 'dosage_unit' => null, 'priority' => 2],
            ],

            // ===== BROWN SPOT =====
            'brown-spot' => [
                // Chemical
                ['type' => 'chemical', 'description' => 'Aplikasi fungisida Mancozeb 80 WP untuk pengendalian bercak coklat', 'dosage' => '2', 'dosage_unit' => 'gram/L', 'priority' => 1],
                ['type' => 'chemical', 'description' => 'Penyemprotan fungisida Propiconazole 250 EC pada fase vegetatif dan generatif', 'dosage' => '1', 'dosage_unit' => 'ml/L', 'priority' => 2],
                ['type' => 'chemical', 'description' => 'Perlakuan benih dengan fungisida Carbendazim sebelum tanam', 'dosage' => '3', 'dosage_unit' => 'gram/kg benih', 'priority' => 3],
                // Prevention
                ['type' => 'prevention', 'description' => 'Pemupukan berimbang NPK sesuai rekomendasi untuk menghindari defisiensi nutrisi', 'dosage' => '300', 'dosage_unit' => 'kg NPK/ha', 'priority' => 1],
                ['type' => 'prevention', 'description' => 'Gunakan benih bersertifikat yang bebas dari infeksi jamur', 'dosage' => null, 'dosage_unit' => null, 'priority' => 2],
                // Biological
                ['type' => 'biological', 'description' => 'Aplikasi Trichoderma harzianum sebagai biofungisida tanah', 'dosage' => '5', 'dosage_unit' => 'gram/L', 'priority' => 1],
                // Cultural
                ['type' => 'cultural', 'description' => 'Perbaiki drainase dan sistem pengairan sawah untuk menghindari genangan berlebihan', 'dosage' => null, 'dosage_unit' => null, 'priority' => 1],
                ['type' => 'cultural', 'description' => 'Tingkatkan kandungan bahan organik tanah dengan pemberian kompos', 'dosage' => '2000', 'dosage_unit' => 'kg/ha', 'priority' => 2],
                ['type' => 'cultural', 'description' => 'Lakukan pengapuran pada tanah masam untuk memperbaiki pH tanah', 'dosage' => '1000', 'dosage_unit' => 'kg dolomit/ha', 'priority' => 3],
            ],

            // ===== TUNGRO =====
            'tungro' => [
                // Chemical (pengendalian vektor)
                ['type' => 'chemical', 'description' => 'Pengendalian wereng hijau dengan insektisida BPMC 50 EC', 'dosage' => '1.5', 'dosage_unit' => 'ml/L', 'priority' => 1],
                ['type' => 'chemical', 'description' => 'Aplikasi insektisida Imidakloprid 200 SL untuk mengendalikan vektor wereng hijau', 'dosage' => '0.5', 'dosage_unit' => 'ml/L', 'priority' => 2],
                ['type' => 'chemical', 'description' => 'Perlakuan benih dengan insektisida sistemik Fipronil 50 SC sebelum tanam', 'dosage' => '3', 'dosage_unit' => 'ml/kg benih', 'priority' => 3],
                // Prevention
                ['type' => 'prevention', 'description' => 'Gunakan varietas tahan tungro seperti Inpari 9, Tukad Unda, atau Bondoyudo', 'dosage' => null, 'dosage_unit' => null, 'priority' => 1],
                ['type' => 'prevention', 'description' => 'Tanam serempak dalam satu hamparan untuk memutus siklus hidup wereng', 'dosage' => null, 'dosage_unit' => null, 'priority' => 2],
                ['type' => 'prevention', 'description' => 'Pasang perangkap lampu (light trap) untuk monitoring populasi wereng hijau', 'dosage' => null, 'dosage_unit' => null, 'priority' => 3],
                // Cultural
                ['type' => 'cultural', 'description' => 'Eradikasi (cabut dan musnahkan) tanaman yang terinfeksi tungro untuk mencegah penyebaran', 'dosage' => null, 'dosage_unit' => null, 'priority' => 1],
                ['type' => 'cultural', 'description' => 'Pergiliran varietas setiap musim tanam untuk menghindari breakdown resistensi', 'dosage' => null, 'dosage_unit' => null, 'priority' => 2],
                ['type' => 'cultural', 'description' => 'Atur waktu tanam untuk menghindari puncak populasi wereng hijau', 'dosage' => null, 'dosage_unit' => null, 'priority' => 3],
            ],

            // ===== BACTERIAL LEAF BLIGHT =====
            'bacterial-leaf-blight' => [
                // Chemical
                ['type' => 'chemical', 'description' => 'Aplikasi bakterisida berbahan aktif Streptomycin sulfat + Oxytetracycline', 'dosage' => '1.5', 'dosage_unit' => 'gram/L', 'priority' => 1],
                ['type' => 'chemical', 'description' => 'Penyemprotan tembaga hidroksida 77 WP sebagai bakterisida kontak', 'dosage' => '2', 'dosage_unit' => 'gram/L', 'priority' => 2],
                ['type' => 'chemical', 'description' => 'Aplikasi Bismerthiazol 20 WP untuk pengendalian bakteri', 'dosage' => '1', 'dosage_unit' => 'gram/L', 'priority' => 3],
                // Prevention
                ['type' => 'prevention', 'description' => 'Gunakan varietas tahan BLB seperti Code, Angke, atau Inpari 13', 'dosage' => null, 'dosage_unit' => null, 'priority' => 1],
                ['type' => 'prevention', 'description' => 'Hindari luka mekanis pada tanaman saat pemeliharaan', 'dosage' => null, 'dosage_unit' => null, 'priority' => 2],
                ['type' => 'prevention', 'description' => 'Kurangi pemupukan nitrogen berlebihan yang meningkatkan kerentanan', 'dosage' => '200', 'dosage_unit' => 'kg urea/ha (maksimal)', 'priority' => 3],
                // Cultural
                ['type' => 'cultural', 'description' => 'Atur drainase sawah agar tidak tergenang berlebihan', 'dosage' => null, 'dosage_unit' => null, 'priority' => 1],
                ['type' => 'cultural', 'description' => 'Bersihkan gulma dan sisa tanaman yang dapat menjadi sumber inokulum bakteri', 'dosage' => null, 'dosage_unit' => null, 'priority' => 2],
                ['type' => 'cultural', 'description' => 'Hindari penggunaan air irigasi dari sawah yang terinfeksi', 'dosage' => null, 'dosage_unit' => null, 'priority' => 3],
            ],

            // ===== HEALTHY =====
            'healthy' => [
                ['type' => 'prevention', 'description' => 'Lanjutkan pemeliharaan rutin dan pemupukan berimbang sesuai rekomendasi', 'dosage' => null, 'dosage_unit' => null, 'priority' => 1],
                ['type' => 'prevention', 'description' => 'Lakukan monitoring rutin setiap 7 hari untuk deteksi dini hama dan penyakit', 'dosage' => null, 'dosage_unit' => null, 'priority' => 2],
                ['type' => 'prevention', 'description' => 'Jaga kebersihan lahan dan saluran irigasi', 'dosage' => null, 'dosage_unit' => null, 'priority' => 3],
                ['type' => 'cultural', 'description' => 'Terapkan sistem tanam jajar legowo untuk optimalisasi hasil', 'dosage' => null, 'dosage_unit' => null, 'priority' => 1],
            ],
        ];

        foreach ($treatments as $diseaseSlug => $diseaseTreatments) {
            $disease = Disease::where('slug', $diseaseSlug)->first();

            if (! $disease) {
                continue;
            }

            foreach ($diseaseTreatments as $treatment) {
                Treatment::create(array_merge($treatment, ['disease_id' => $disease->id]));
            }
        }
    }
}
