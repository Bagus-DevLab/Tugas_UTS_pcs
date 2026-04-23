<?php

namespace Database\Seeders;

use App\Models\Disease;
use Illuminate\Database\Seeder;

class DiseaseSeeder extends Seeder
{
    public function run(): void
    {
        $diseases = [
            [
                'name' => 'Blast',
                'slug' => 'blast',
                'latin_name' => 'Pyricularia oryzae',
                'description' => 'Penyakit blast disebabkan oleh jamur Pyricularia oryzae (Magnaporthe oryzae). Merupakan salah satu penyakit paling merusak pada tanaman padi di seluruh dunia. Jamur ini dapat menyerang semua bagian tanaman padi di atas tanah, termasuk daun, leher malai, buku batang, dan gabah. Serangan berat dapat menyebabkan kehilangan hasil panen hingga 50-100%.',
                'cause' => 'Jamur Pyricularia oryzae yang menyebar melalui spora udara (konidia). Berkembang pesat pada kondisi kelembaban tinggi (>90%), suhu 25-28°C, embun pagi yang lama, dan pemupukan nitrogen berlebihan.',
            ],
            [
                'name' => 'Brown Spot',
                'slug' => 'brown-spot',
                'latin_name' => 'Bipolaris oryzae',
                'description' => 'Penyakit bercak coklat (brown spot) disebabkan oleh jamur Bipolaris oryzae (Helminthosporium oryzae). Menyerang daun, pelepah daun, dan gabah. Penyakit ini sering terjadi pada tanah yang kekurangan nutrisi, terutama kalium dan fosfor.',
                'cause' => 'Jamur Bipolaris oryzae yang terkait erat dengan defisiensi kalium dan fosfor pada tanah. Berkembang pada suhu 25-30°C dengan kelembaban tinggi.',
            ],
            [
                'name' => 'Tungro',
                'slug' => 'tungro',
                'latin_name' => 'Rice Tungro Bacilliform Virus (RTBV) & Rice Tungro Spherical Virus (RTSV)',
                'description' => 'Penyakit tungro disebabkan oleh dua jenis virus (RTBV dan RTSV) yang ditularkan oleh wereng hijau (Nephotettix virescens). Menyebabkan pertumbuhan tanaman terhambat, daun menguning, dan penurunan hasil panen drastis.',
                'cause' => 'Virus RTBV dan RTSV yang ditularkan oleh vektor wereng hijau. Penyebaran cepat pada musim hujan saat populasi wereng tinggi.',
            ],
            [
                'name' => 'Bacterial Leaf Blight',
                'slug' => 'bacterial-leaf-blight',
                'latin_name' => 'Xanthomonas oryzae pv. oryzae',
                'description' => 'Penyakit hawar daun bakteri (HDB) disebabkan oleh bakteri Xanthomonas oryzae pv. oryzae. Merupakan penyakit bakteri paling penting pada tanaman padi. Bakteri masuk melalui luka atau stomata dan menyebar melalui pembuluh xylem.',
                'cause' => 'Bakteri Xanthomonas oryzae pv. oryzae yang masuk melalui luka mekanis atau lubang alami pada daun. Menyebar melalui air irigasi, percikan hujan, dan angin.',
            ],
            [
                'name' => 'Healthy',
                'slug' => 'healthy',
                'latin_name' => null,
                'description' => 'Tanaman padi dalam kondisi sehat tanpa gejala penyakit. Daun berwarna hijau segar dan cerah, pertumbuhan normal sesuai fase tumbuh, batang kokoh, dan anakan tumbuh optimal.',
                'cause' => 'Tidak ada penyebab penyakit. Tanaman dalam kondisi optimal dengan pemeliharaan yang baik.',
            ],
            // ===== 6 KELAS BARU =====
            [
                'name' => 'Hispa',
                'slug' => 'hispa',
                'latin_name' => 'Dicladispa armigera',
                'description' => 'Hispa (kumbang pengerek daun) adalah hama yang menyerang daun padi. Larva mengorok di dalam jaringan daun membentuk terowongan, sedangkan kumbang dewasa mengikis permukaan atas daun. Serangan berat menyebabkan daun memutih dan mengering.',
                'cause' => 'Kumbang Dicladispa armigera. Larva mengorok di dalam daun, kumbang dewasa mengikis permukaan daun. Populasi meningkat pada musim hujan dan kelembaban tinggi.',
            ],
            [
                'name' => 'Dead Heart',
                'slug' => 'dead-heart',
                'latin_name' => 'Scirpophaga incertulas',
                'description' => 'Dead heart (sundep) disebabkan oleh larva penggerek batang padi kuning (Scirpophaga incertulas). Larva menggerek batang padi sehingga pucuk tanaman mati dan mudah dicabut. Pada fase generatif menyebabkan beluk (malai hampa putih).',
                'cause' => 'Larva penggerek batang padi kuning (Scirpophaga incertulas) yang menggerek masuk ke dalam batang padi. Ngengat betina meletakkan telur pada daun, larva kemudian masuk ke batang.',
            ],
            [
                'name' => 'Downy Mildew',
                'slug' => 'downy-mildew',
                'latin_name' => 'Sclerophthora macrospora',
                'description' => 'Bulai (downy mildew) pada padi disebabkan oleh jamur Sclerophthora macrospora. Menyebabkan pertumbuhan abnormal, daun menguning dengan garis-garis klorotik, dan pembentukan malai yang tidak normal. Tanaman yang terinfeksi sering kerdil.',
                'cause' => 'Jamur Sclerophthora macrospora yang menyebar melalui zoospora di air. Berkembang pada kondisi tergenang dan suhu rendah (20-25°C). Infeksi terjadi melalui akar atau bagian tanaman yang terendam.',
            ],
            [
                'name' => 'Bacterial Leaf Streak',
                'slug' => 'bacterial-leaf-streak',
                'latin_name' => 'Xanthomonas oryzae pv. oryzicola',
                'description' => 'Garis bakteri daun (bacterial leaf streak) disebabkan oleh bakteri Xanthomonas oryzae pv. oryzicola. Berbeda dengan BLB, penyakit ini menunjukkan garis-garis coklat sempit di antara tulang daun. Eksudat bakteri berwarna kuning sering terlihat.',
                'cause' => 'Bakteri Xanthomonas oryzae pv. oryzicola yang masuk melalui stomata. Menyebar melalui percikan air hujan dan angin. Berkembang pada suhu 25-30°C dan kelembaban tinggi.',
            ],
            [
                'name' => 'Bacterial Panicle Blight',
                'slug' => 'bacterial-panicle-blight',
                'latin_name' => 'Burkholderia glumae',
                'description' => 'Hawar malai bakteri (bacterial panicle blight) disebabkan oleh bakteri Burkholderia glumae. Menyerang malai padi menyebabkan gabah berubah warna, steril, dan busuk. Penyakit ini sering muncul pada suhu tinggi saat fase pembungaan.',
                'cause' => 'Bakteri Burkholderia glumae yang menginfeksi malai saat pembungaan. Berkembang optimal pada suhu tinggi (>30°C) dan kelembaban tinggi. Bakteri dapat terbawa benih.',
            ],
            [
                'name' => 'Leaf Smut',
                'slug' => 'leaf-smut',
                'latin_name' => 'Entyloma oryzae',
                'description' => 'Noda hitam daun (leaf smut) disebabkan oleh jamur Entyloma oryzae. Menyebabkan bintik-bintik hitam kecil berbentuk sudut pada permukaan daun. Serangan berat menyebabkan daun menguning dan mengering prematur.',
                'cause' => 'Jamur Entyloma oryzae yang menyebar melalui spora udara. Berkembang pada kelembaban tinggi dan suhu 25-30°C. Spora bertahan pada sisa tanaman yang terinfeksi.',
            ],
        ];

        foreach ($diseases as $disease) {
            Disease::create($disease);
        }
    }
}
