<?php

namespace Database\Seeders;

use App\Models\Symptom;
use Illuminate\Database\Seeder;

class SymptomSeeder extends Seeder
{
    public function run(): void
    {
        $symptoms = [
            // === Gejala Blast (G01-G05) ===
            ['code' => 'G01', 'name' => 'Bercak berbentuk belah ketupat pada daun', 'description' => 'Lesi pada daun berbentuk belah ketupat (diamond/eye-shaped) dengan ujung lancip.'],
            ['code' => 'G02', 'name' => 'Bercak berwarna abu-abu di tengah dengan tepi coklat', 'description' => 'Bagian tengah bercak berwarna abu-abu keputihan sedangkan tepinya berwarna coklat kemerahan.'],
            ['code' => 'G03', 'name' => 'Daun mengering dari ujung', 'description' => 'Daun mulai mengering dan mati dari bagian ujung, kemudian menyebar ke pangkal.'],
            ['code' => 'G04', 'name' => 'Leher malai patah atau busuk', 'description' => 'Pangkal malai membusuk dan patah sehingga malai menggantung (neck blast).'],
            ['code' => 'G05', 'name' => 'Gabah hampa atau tidak terisi penuh', 'description' => 'Gabah tidak terisi atau hanya terisi sebagian akibat serangan pada malai.'],

            // === Gejala Brown Spot (G06-G10) ===
            ['code' => 'G06', 'name' => 'Bercak oval berwarna coklat pada daun', 'description' => 'Bercak berbentuk oval atau bulat lonjong berwarna coklat gelap pada permukaan daun.'],
            ['code' => 'G07', 'name' => 'Bercak dengan lingkaran kuning (halo)', 'description' => 'Bercak coklat dikelilingi oleh lingkaran berwarna kuning (halo/chlorotic zone).'],
            ['code' => 'G08', 'name' => 'Bercak pada pelepah daun', 'description' => 'Bercak coklat juga muncul pada pelepah daun (leaf sheath).'],
            ['code' => 'G09', 'name' => 'Biji/gabah berubah warna coklat kehitaman', 'description' => 'Gabah yang terinfeksi berubah warna menjadi coklat kehitaman.'],
            ['code' => 'G10', 'name' => 'Pertumbuhan tanaman terhambat', 'description' => 'Tanaman menunjukkan pertumbuhan yang lambat dan kurang vigor.'],

            // === Gejala Tungro (G11-G15, G20) ===
            ['code' => 'G11', 'name' => 'Daun menguning dari ujung ke pangkal', 'description' => 'Daun berubah warna menjadi kuning atau oranye kekuningan dari ujung ke pangkal.'],
            ['code' => 'G12', 'name' => 'Tanaman kerdil (stunting)', 'description' => 'Tinggi tanaman jauh lebih pendek dari normal.'],
            ['code' => 'G13', 'name' => 'Jumlah anakan berkurang', 'description' => 'Tanaman menghasilkan anakan (tiller) yang lebih sedikit dari normal.'],
            ['code' => 'G14', 'name' => 'Daun menggulung ke dalam', 'description' => 'Helai daun menggulung ke arah dalam (inward rolling).'],
            ['code' => 'G15', 'name' => 'Malai tidak keluar sempurna atau steril', 'description' => 'Malai tidak dapat keluar sepenuhnya atau keluar tetapi steril.'],

            // === Gejala BLB (G16-G19) ===
            ['code' => 'G16', 'name' => 'Tepi daun mengering berwarna abu-abu keputihan', 'description' => 'Tepi daun mengering dan berubah warna menjadi abu-abu keputihan.'],
            ['code' => 'G17', 'name' => 'Eksudat bakteri (tetesan kuning) pada pagi hari', 'description' => 'Tetesan cairan berwarna kuning kecoklatan (eksudat bakteri) pada permukaan daun.'],
            ['code' => 'G18', 'name' => 'Daun menggulung memanjang', 'description' => 'Daun menggulung memanjang sepanjang tulang daun dan tampak layu.'],
            ['code' => 'G19', 'name' => 'Tanaman layu secara keseluruhan', 'description' => 'Seluruh tanaman menunjukkan gejala layu (kresek).'],
            ['code' => 'G20', 'name' => 'Garis-garis kuning pada daun muda', 'description' => 'Daun muda menunjukkan garis-garis kuning atau perubahan warna kuning tidak merata.'],

            // === Gejala Hispa (G21-G25) ===
            ['code' => 'G21', 'name' => 'Goresan putih memanjang pada permukaan daun', 'description' => 'Kumbang dewasa mengikis permukaan atas daun membentuk goresan putih sejajar tulang daun.'],
            ['code' => 'G22', 'name' => 'Terowongan/lorong di dalam jaringan daun', 'description' => 'Larva mengorok di dalam jaringan daun membentuk terowongan transparan.'],
            ['code' => 'G23', 'name' => 'Daun memutih dan mengering', 'description' => 'Daun yang terserang berat berubah putih dan mengering.'],
            ['code' => 'G24', 'name' => 'Terdapat kumbang kecil hitam berduri pada daun', 'description' => 'Kumbang hispa dewasa berwarna hitam kebiruan dengan duri-duri pada tubuhnya terlihat pada daun.'],
            ['code' => 'G25', 'name' => 'Ujung daun terpotong tidak beraturan', 'description' => 'Kumbang dewasa memakan ujung daun sehingga tampak terpotong tidak beraturan.'],

            // === Gejala Dead Heart (G26-G30) ===
            ['code' => 'G26', 'name' => 'Pucuk tanaman muda mati dan coklat', 'description' => 'Pucuk tengah tanaman muda mati, berubah coklat, dan mudah dicabut (sundep).'],
            ['code' => 'G27', 'name' => 'Lubang kecil pada batang dekat pangkal', 'description' => 'Terdapat lubang masuk larva pada batang dekat permukaan air atau pangkal tanaman.'],
            ['code' => 'G28', 'name' => 'Malai putih hampa (beluk)', 'description' => 'Malai berwarna putih dan hampa karena batang digerek pada fase generatif.'],
            ['code' => 'G29', 'name' => 'Serbuk gerek pada batang', 'description' => 'Terdapat serbuk halus (frass) hasil gerakan larva di dalam batang.'],
            ['code' => 'G30', 'name' => 'Batang mudah patah saat ditekan', 'description' => 'Batang yang digerek menjadi rapuh dan mudah patah saat ditekan.'],

            // === Gejala Downy Mildew (G31-G35) ===
            ['code' => 'G31', 'name' => 'Garis-garis klorotik kuning pada daun', 'description' => 'Daun menunjukkan garis-garis kuning pucat (klorotik) sejajar tulang daun.'],
            ['code' => 'G32', 'name' => 'Pertumbuhan daun abnormal dan kaku', 'description' => 'Daun tumbuh tegak, kaku, dan lebih sempit dari normal.'],
            ['code' => 'G33', 'name' => 'Lapisan tepung putih pada permukaan bawah daun', 'description' => 'Permukaan bawah daun terlihat lapisan spora berwarna putih keabu-abuan.'],
            ['code' => 'G34', 'name' => 'Malai berubah menjadi struktur daun (phyllody)', 'description' => 'Malai berubah bentuk menjadi struktur menyerupai daun (phyllody/leafy panicle).'],
            ['code' => 'G35', 'name' => 'Tanaman kerdil dengan anakan berlebihan', 'description' => 'Tanaman kerdil tetapi menghasilkan anakan berlebihan yang tidak produktif.'],

            // === Gejala Bacterial Leaf Streak (G36-G39) ===
            ['code' => 'G36', 'name' => 'Garis-garis coklat sempit antar tulang daun', 'description' => 'Garis-garis coklat kemerahan sempit yang terbatas di antara tulang daun.'],
            ['code' => 'G37', 'name' => 'Eksudat bakteri kuning pada garis daun', 'description' => 'Tetesan eksudat bakteri berwarna kuning muncul pada garis-garis yang terinfeksi.'],
            ['code' => 'G38', 'name' => 'Garis coklat menyatu menjadi bercak besar', 'description' => 'Pada serangan berat, garis-garis coklat menyatu membentuk bercak nekrotik besar.'],
            ['code' => 'G39', 'name' => 'Daun mengering dari tepi dengan pola garis', 'description' => 'Daun mengering mengikuti pola garis-garis infeksi dari tepi ke tengah.'],

            // === Gejala Bacterial Panicle Blight (G40-G43) ===
            ['code' => 'G40', 'name' => 'Gabah berubah warna coklat keabu-abuan', 'description' => 'Gabah pada malai berubah warna menjadi coklat keabu-abuan dan tampak busuk.'],
            ['code' => 'G41', 'name' => 'Malai tegak tidak merunduk', 'description' => 'Malai tetap tegak karena gabah tidak terisi (tidak merunduk seperti normal).'],
            ['code' => 'G42', 'name' => 'Gabah steril pada bagian atas malai', 'description' => 'Gabah steril terutama pada bagian atas/ujung malai, bagian bawah mungkin masih normal.'],
            ['code' => 'G43', 'name' => 'Bau busuk pada malai yang terinfeksi', 'description' => 'Malai yang terinfeksi berat mengeluarkan bau busuk khas infeksi bakteri.'],

            // === Gejala Leaf Smut (G44-G47) ===
            ['code' => 'G44', 'name' => 'Bintik-bintik hitam kecil pada daun', 'description' => 'Bintik-bintik hitam kecil (0.5-5mm) berbentuk sudut pada permukaan daun.'],
            ['code' => 'G45', 'name' => 'Bintik hitam tersebar merata pada helai daun', 'description' => 'Bintik-bintik hitam tersebar merata pada seluruh permukaan helai daun.'],
            ['code' => 'G46', 'name' => 'Massa spora hitam keluar dari bintik', 'description' => 'Pada kondisi lembab, massa spora berwarna hitam keluar dari bintik-bintik pada daun.'],
            ['code' => 'G47', 'name' => 'Daun menguning dan mengering prematur', 'description' => 'Daun yang terinfeksi berat menguning dan mengering lebih awal dari normal.'],
        ];

        foreach ($symptoms as $symptom) {
            Symptom::create($symptom);
        }
    }
}
