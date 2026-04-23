<?php

namespace Database\Seeders;

use App\Models\Disease;
use Illuminate\Database\Seeder;

class DiseaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $diseases = [
            [
                'name' => 'Blast',
                'slug' => 'blast',
                'latin_name' => 'Pyricularia oryzae',
                'description' => 'Penyakit blast disebabkan oleh jamur Pyricularia oryzae (Magnaporthe oryzae). Merupakan salah satu penyakit paling merusak pada tanaman padi di seluruh dunia. Jamur ini dapat menyerang semua bagian tanaman padi di atas tanah, termasuk daun, leher malai, buku batang, dan gabah. Serangan berat dapat menyebabkan kehilangan hasil panen hingga 50-100%.',
                'cause' => 'Jamur Pyricularia oryzae yang menyebar melalui spora udara (konidia). Berkembang pesat pada kondisi kelembaban tinggi (>90%), suhu 25-28°C, embun pagi yang lama, dan pemupukan nitrogen berlebihan. Varietas padi yang rentan dan penanaman monokultur terus-menerus meningkatkan risiko serangan.',
            ],
            [
                'name' => 'Brown Spot',
                'slug' => 'brown-spot',
                'latin_name' => 'Bipolaris oryzae',
                'description' => 'Penyakit bercak coklat (brown spot) disebabkan oleh jamur Bipolaris oryzae (Helminthosporium oryzae). Menyerang daun, pelepah daun, dan gabah. Penyakit ini sering terjadi pada tanah yang kekurangan nutrisi, terutama kalium dan fosfor. Serangan berat dapat menurunkan hasil panen 10-40% dan menurunkan kualitas gabah.',
                'cause' => 'Jamur Bipolaris oryzae yang terkait erat dengan defisiensi kalium dan fosfor pada tanah. Berkembang pada suhu 25-30°C dengan kelembaban tinggi. Spora bertahan pada sisa-sisa tanaman dan benih yang terinfeksi. Tanah masam dan drainase buruk meningkatkan keparahan penyakit.',
            ],
            [
                'name' => 'Tungro',
                'slug' => 'tungro',
                'latin_name' => 'Rice Tungro Bacilliform Virus (RTBV) & Rice Tungro Spherical Virus (RTSV)',
                'description' => 'Penyakit tungro disebabkan oleh dua jenis virus, yaitu Rice Tungro Bacilliform Virus (RTBV) dan Rice Tungro Spherical Virus (RTSV), yang ditularkan oleh wereng hijau (Nephotettix virescens). Tungro menyebabkan pertumbuhan tanaman terhambat, daun menguning, dan penurunan hasil panen yang drastis hingga 100% pada serangan berat.',
                'cause' => 'Virus RTBV dan RTSV yang ditularkan oleh vektor wereng hijau (Nephotettix virescens). Kedua virus harus ada bersamaan untuk menimbulkan gejala tungro yang khas. Penyebaran cepat terjadi pada musim hujan saat populasi wereng hijau tinggi. Tanaman padi yang terinfeksi menjadi sumber inokulum bagi wereng untuk menularkan ke tanaman sehat.',
            ],
            [
                'name' => 'Bacterial Leaf Blight',
                'slug' => 'bacterial-leaf-blight',
                'latin_name' => 'Xanthomonas oryzae pv. oryzae',
                'description' => 'Penyakit hawar daun bakteri (HDB) atau Bacterial Leaf Blight (BLB) disebabkan oleh bakteri Xanthomonas oryzae pv. oryzae. Merupakan penyakit bakteri paling penting pada tanaman padi. Bakteri masuk melalui luka atau lubang alami (stomata, hidatoda) dan menyebar melalui pembuluh xylem. Serangan berat dapat menyebabkan kehilangan hasil 20-50%.',
                'cause' => 'Bakteri Xanthomonas oryzae pv. oryzae yang masuk melalui luka mekanis atau lubang alami pada daun (stomata, hidatoda). Menyebar melalui air irigasi, percikan hujan, angin, dan alat pertanian yang terkontaminasi. Berkembang optimal pada suhu 26-30°C dengan kelembaban tinggi. Pemupukan nitrogen berlebihan dan genangan air meningkatkan keparahan.',
            ],
            [
                'name' => 'Healthy',
                'slug' => 'healthy',
                'latin_name' => null,
                'description' => 'Tanaman padi dalam kondisi sehat tanpa gejala penyakit. Daun berwarna hijau segar dan cerah, pertumbuhan normal sesuai fase tumbuh, batang kokoh, dan anakan tumbuh optimal. Tanaman sehat menunjukkan vigor yang baik dan mampu berproduksi secara maksimal.',
                'cause' => 'Tidak ada penyebab penyakit. Tanaman dalam kondisi optimal dengan pemeliharaan yang baik, pemupukan berimbang, pengairan teratur, dan pengendalian hama penyakit yang tepat.',
            ],
        ];

        foreach ($diseases as $disease) {
            Disease::create($disease);
        }
    }
}
