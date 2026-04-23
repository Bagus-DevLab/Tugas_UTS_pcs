<?php

namespace Database\Seeders;

use App\Models\Symptom;
use Illuminate\Database\Seeder;

class SymptomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $symptoms = [
            // Gejala Blast
            ['code' => 'G01', 'name' => 'Bercak berbentuk belah ketupat pada daun', 'description' => 'Lesi pada daun berbentuk belah ketupat (diamond/eye-shaped) dengan ujung lancip, merupakan gejala khas penyakit blast.'],
            ['code' => 'G02', 'name' => 'Bercak berwarna abu-abu di tengah dengan tepi coklat', 'description' => 'Bagian tengah bercak berwarna abu-abu keputihan sedangkan tepinya berwarna coklat kemerahan.'],
            ['code' => 'G03', 'name' => 'Daun mengering dari ujung', 'description' => 'Daun mulai mengering dan mati dari bagian ujung, kemudian menyebar ke bagian pangkal daun.'],
            ['code' => 'G04', 'name' => 'Leher malai patah atau busuk', 'description' => 'Pangkal malai (leher malai) membusuk dan patah sehingga malai menggantung, dikenal sebagai neck blast.'],
            ['code' => 'G05', 'name' => 'Gabah hampa atau tidak terisi penuh', 'description' => 'Gabah tidak terisi atau hanya terisi sebagian akibat serangan pada malai dan leher malai.'],

            // Gejala Brown Spot
            ['code' => 'G06', 'name' => 'Bercak oval berwarna coklat pada daun', 'description' => 'Bercak berbentuk oval atau bulat lonjong berwarna coklat gelap pada permukaan daun.'],
            ['code' => 'G07', 'name' => 'Bercak dengan lingkaran kuning (halo) di sekitarnya', 'description' => 'Bercak coklat dikelilingi oleh lingkaran berwarna kuning (halo/chlorotic zone) yang jelas.'],
            ['code' => 'G08', 'name' => 'Bercak pada pelepah daun', 'description' => 'Bercak coklat juga muncul pada pelepah daun (leaf sheath), tidak hanya pada helai daun.'],
            ['code' => 'G09', 'name' => 'Biji/gabah berubah warna menjadi coklat kehitaman', 'description' => 'Gabah yang terinfeksi berubah warna menjadi coklat kehitaman dan kualitasnya menurun.'],
            ['code' => 'G10', 'name' => 'Pertumbuhan tanaman terhambat', 'description' => 'Tanaman menunjukkan pertumbuhan yang lambat dan kurang vigor dibandingkan tanaman sehat.'],

            // Gejala Tungro
            ['code' => 'G11', 'name' => 'Daun menguning dari ujung ke pangkal', 'description' => 'Daun berubah warna menjadi kuning atau oranye kekuningan, dimulai dari ujung daun menyebar ke pangkal.'],
            ['code' => 'G12', 'name' => 'Tanaman kerdil (stunting)', 'description' => 'Tinggi tanaman jauh lebih pendek dari normal, pertumbuhan sangat terhambat.'],
            ['code' => 'G13', 'name' => 'Jumlah anakan berkurang', 'description' => 'Tanaman menghasilkan anakan (tiller) yang lebih sedikit dari normal.'],
            ['code' => 'G14', 'name' => 'Daun menggulung ke dalam', 'description' => 'Helai daun menggulung ke arah dalam (inward rolling) sepanjang tulang daun.'],
            ['code' => 'G15', 'name' => 'Malai tidak keluar sempurna atau steril', 'description' => 'Malai tidak dapat keluar sepenuhnya dari pelepah atau keluar tetapi steril (tidak menghasilkan gabah).'],

            // Gejala BLB
            ['code' => 'G16', 'name' => 'Tepi daun mengering berwarna abu-abu keputihan', 'description' => 'Tepi daun mengering dan berubah warna menjadi abu-abu keputihan, menyebar dari ujung ke pangkal mengikuti tepi daun.'],
            ['code' => 'G17', 'name' => 'Eksudat bakteri (tetesan kuning) pada pagi hari', 'description' => 'Pada pagi hari saat kelembaban tinggi, terlihat tetesan cairan berwarna kuning kecoklatan (eksudat bakteri) pada permukaan daun yang terinfeksi.'],
            ['code' => 'G18', 'name' => 'Daun menggulung memanjang', 'description' => 'Daun menggulung memanjang sepanjang tulang daun dan tampak layu, terutama pada fase kresek.'],
            ['code' => 'G19', 'name' => 'Tanaman layu secara keseluruhan', 'description' => 'Seluruh tanaman menunjukkan gejala layu (kresek), terutama pada tanaman muda. Daun mengering dan tanaman mati.'],
            ['code' => 'G20', 'name' => 'Garis-garis kuning pada daun muda', 'description' => 'Daun muda menunjukkan garis-garis kuning atau perubahan warna kuning yang tidak merata, sering terlihat pada infeksi tungro.'],
        ];

        foreach ($symptoms as $symptom) {
            Symptom::create($symptom);
        }
    }
}
