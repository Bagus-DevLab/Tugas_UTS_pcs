# Dokumentasi Machine Learning MAPAN

Dokumen ini menjelaskan komponen machine learning pada project MAPAN secara end-to-end: sumber data, labeling, pembersihan, pembagian dataset, preprocessing, training, evaluasi, artefak model, integrasi aplikasi web, dan langkah reproduksi. Fokus ML di project ini adalah klasifikasi citra daun padi untuk mendukung fitur deteksi penyakit berbasis gambar.

## 1. Ringkasan

MAPAN menggunakan model klasifikasi citra untuk memprediksi kondisi daun padi dari foto yang diunggah pengguna. Model menerima gambar daun, melakukan preprocessing menjadi tensor berukuran `224 x 224 x 3`, lalu mengembalikan probabilitas untuk 11 kelas. Prediksi dengan probabilitas tertinggi digunakan sebagai hasil utama, sedangkan probabilitasnya ditampilkan sebagai confidence dalam rentang 0 sampai 100 persen.

Karakter utama implementasi:

- Jenis masalah: multi-class image classification.
- Arsitektur: MobileNetV2 dengan transfer learning.
- Input model: gambar RGB `224 x 224`.
- Output model: softmax 11 kelas.
- Training: Python, TensorFlow/Keras.
- Inferensi aplikasi: browser, ONNX Runtime Web.
- Penyimpanan hasil deteksi: Laravel menyimpan label, confidence, metode, gambar, cuaca, dan lokasi jika tersedia.

## 2. Lokasi File Penting

| Area | File/Folder | Fungsi |
|---|---|---|
| Dataset mentah lapangan | `ml/smartfarmingimage/` | Foto awal yang bisa dilabel manual |
| Dataset berlabel | `ml/dataset/` | Dataset sumber dengan struktur folder per kelas |
| Dataset split | `ml/dataset_split/` | Output train, validation, dan test |
| Labeling manual | `ml/label_dataset.py` | Tool terminal untuk memberi label foto |
| Pembersihan dataset | `ml/clean_dataset.py` | Quarantine file rusak, metadata, dan duplikasi |
| Split dataset | `ml/split_dataset.py` | Membagi dataset menjadi train/val/test |
| Training | `ml/train_model.py` | Training MobileNetV2 dan evaluasi |
| Konversi TF.js | `ml/convert_to_tfjs.py` | Konversi Keras `.h5` ke TensorFlow.js layers model |
| Model Keras | `ml/model/rice_disease_model.h5` | Model hasil training utama |
| Model ONNX | `ml/model/rice_disease.onnx` | Model untuk ONNX Runtime Web |
| Loader frontend | `resources/js/lib/ml-model.ts` | Load model, preprocessing, inferensi, sorting prediksi |
| Halaman deteksi | `resources/js/pages/detection/index.tsx` | UI upload, scan, preview, simpan hasil |
| Backend simpan hasil | `app/Http/Controllers/DetectionController.php` | Validasi dan simpan riwayat deteksi web |
| Backend API deteksi | `app/Http/Controllers/Api/DetectionApiController.php` | Endpoint deteksi untuk API private |

## 3. Kelas Prediksi

Model menggunakan 11 kelas. Urutan kelas wajib konsisten antara training, artefak model, dan frontend.

| Index | Kelas | Makna |
|---:|---|---|
| 0 | Bacterial Leaf Blight | Hawar daun bakteri |
| 1 | Bacterial Leaf Streak | Garis daun bakteri |
| 2 | Bacterial Panicle Blight | Hawar malai bakteri |
| 3 | Blast | Penyakit blas |
| 4 | Brown Spot | Bercak coklat |
| 5 | Dead Heart | Gejala sundep/dead heart |
| 6 | Downy Mildew | Bulai/downy mildew |
| 7 | Healthy | Daun sehat |
| 8 | Hispa | Serangan hama hispa |
| 9 | Leaf Smut | Gosong daun |
| 10 | Tungro | Tungro |

Definisi urutan kelas berada di:

- `ml/train_model.py` pada konstanta `CLASS_NAMES`.
- `resources/js/lib/ml-model.ts` pada konstanta `CLASS_LABELS`.
- `ml/split_dataset.py` pada `FOLDER_MAP` untuk normalisasi nama folder.

Jika kelas baru ditambahkan, ketiga tempat tersebut harus diperbarui bersama, dataset harus di-split ulang, model harus di-training ulang, dan test frontend `resources/js/lib/ml-model.test.ts` harus disesuaikan.

## 4. Alur Pipeline ML

Pipeline lengkap:

1. Kumpulkan foto daun padi.
2. Label foto manual jika data berasal dari `ml/smartfarmingimage/`.
3. Simpan dataset berlabel di `ml/dataset/<nama-kelas>/`.
4. Bersihkan dataset dengan quarantine, bukan delete permanen.
5. Split dataset menjadi train, validation, dan test.
6. Training MobileNetV2 dalam dua fase.
7. Evaluasi model dengan test set.
8. Simpan artefak model dan grafik evaluasi.
9. Konversi atau deploy model ke format yang dipakai frontend.
10. Frontend menjalankan inferensi di browser.
11. Hasil deteksi disimpan ke backend jika pengguna menyimpan riwayat.

## 5. Labeling Dataset

`ml/label_dataset.py` digunakan untuk memberi label foto dari `ml/smartfarmingimage/`. Tool ini membuka gambar satu per satu dengan image viewer sistem, lalu user memilih label melalui terminal.

Label bawaan tool:

| Tombol | Label |
|---|---|
| `1` | Blast |
| `2` | Brown Spot |
| `3` | Tungro |
| `4` | Bacterial Leaf Blight |
| `5` | Healthy |
| `s` | Skip |
| `u` | Undo |
| `q` | Quit |

Catatan:

- File utama dan varian crop seperti `~2`, `~3` ikut disalin ke folder label yang sama.
- Progress disimpan di `ml/label_progress.json`.
- Output labeling masuk ke `ml/dataset/`.
- Tool labeling saat ini hanya memetakan 5 label utama. Kelas tambahan pada dataset dapat berasal dari sumber lain atau perlu ditambahkan ke `LABELS` jika ingin dilabel lewat tool ini.

## 6. Pembersihan Dataset

`ml/clean_dataset.py` membersihkan dataset sumber di `ml/dataset/` sebelum split. File bermasalah dipindahkan ke quarantine agar masih dapat diaudit.

Jenis data yang ditangani:

- Gambar corrupt atau tidak bisa dibaca oleh PIL.
- File metadata seperti `Zone.Identifier`.
- Duplikasi dalam kelas yang sama.
- Duplikasi lintas kelas, yaitu file identik yang muncul pada lebih dari satu label.

Struktur quarantine:

```text
ml/dataset/_quarantine/
├── invalid/
├── metadata/
├── same_class_duplicates/
└── cross_class_duplicates/
```

Pembersihan penting karena file rusak dapat menghentikan training, sedangkan duplikasi lintas kelas dapat membuat label kontradiktif dan merusak evaluasi model.

## 7. Split Dataset

`ml/split_dataset.py` membaca `ml/dataset/`, menormalisasi nama folder, lalu menyalin gambar ke `ml/dataset_split/`.

Struktur output:

```text
ml/dataset_split/
├── train/
├── val/
└── test/
```

Konfigurasi split:

| Parameter | Nilai |
|---|---:|
| Train | 80 persen |
| Validation | 10 persen |
| Test | 10 persen |
| Random seed | 42 |
| Ekstensi | `.jpg`, `.jpeg`, `.png` |

Dataset split saat dokumen ini diperbarui:

| Kelas | Train | Validation | Test | Total |
|---|---:|---:|---:|---:|
| Bacterial Leaf Blight | 1896 | 237 | 238 | 2371 |
| Bacterial Leaf Streak | 304 | 38 | 38 | 380 |
| Bacterial Panicle Blight | 268 | 33 | 35 | 336 |
| Blast | 3580 | 447 | 448 | 4475 |
| Brown Spot | 2584 | 323 | 324 | 3231 |
| Dead Heart | 1143 | 142 | 144 | 1429 |
| Downy Mildew | 494 | 61 | 63 | 618 |
| Healthy | 3180 | 397 | 399 | 3976 |
| Hispa | 2064 | 258 | 258 | 2580 |
| Leaf Smut | 638 | 79 | 81 | 798 |
| Tungro | 1910 | 238 | 240 | 2388 |
| Total | 18061 | 2253 | 2268 | 22582 |

Distribusi ini tidak seimbang. Kelas seperti `Blast` dan `Healthy` jauh lebih besar dibanding `Bacterial Panicle Blight` dan `Bacterial Leaf Streak`. Karena itu training menggunakan balanced class weight.

## 8. Preprocessing Citra

Preprocessing training dan browser dibuat konsisten dengan MobileNetV2.

Langkah preprocessing:

1. Gambar dibaca sebagai RGB.
2. Gambar di-resize menjadi `224 x 224`.
3. Nilai pixel dinormalisasi dari `0..255` ke `-1..1`.
4. Tensor input memakai layout NHWC: `[1, 224, 224, 3]`.

Rumus normalisasi:

```text
pixel_baru = pixel / 127.5 - 1
```

Implementasi:

- Training: `tf.keras.applications.mobilenet_v2.preprocess_input` di `ml/train_model.py`.
- Browser: `preprocessImage()` di `resources/js/lib/ml-model.ts`.

Konsistensi preprocessing adalah syarat penting. Jika training memakai normalisasi berbeda dari inferensi browser, confidence dan akurasi prediksi dapat turun meskipun model training terlihat baik.

## 9. Augmentasi Data

Augmentasi hanya diterapkan pada train set melalui `ImageDataGenerator`.

| Teknik | Nilai |
|---|---|
| Rotation | 20 derajat |
| Width shift | 0.2 |
| Height shift | 0.2 |
| Horizontal flip | Aktif |
| Vertical flip | Aktif |
| Zoom | 0.2 |
| Brightness | 0.8 sampai 1.2 |
| Fill mode | nearest |

Validation dan test set tidak diberi augmentasi agar evaluasi tetap mencerminkan performa model terhadap data asli yang tidak dimodifikasi.

## 10. Arsitektur Model

Model memakai MobileNetV2 pretrained ImageNet sebagai feature extractor. Top classifier bawaan MobileNetV2 tidak digunakan, lalu diganti dengan classification head khusus untuk 11 kelas.

Struktur:

```text
Input 224 x 224 x 3
MobileNetV2 include_top=False, weights=imagenet
GlobalAveragePooling2D
Dense 256, ReLU
Dropout 0.4
Dense 128, ReLU
Dropout 0.3
Dense 11, Softmax
```

Softmax digunakan karena satu gambar diasumsikan memiliki satu kelas utama. Output layer menghasilkan probabilitas per kelas, lalu frontend mengubahnya menjadi persen.

## 11. Strategi Training

Training dilakukan dalam dua fase.

### Fase 1: Classification Head

Pada fase pertama, semua layer MobileNetV2 dibekukan. Hanya classification head yang dilatih.

| Parameter | Nilai |
|---|---:|
| Epoch maksimum | 20 |
| Optimizer | Adam |
| Learning rate | 0.001 |
| Loss | categorical_crossentropy |
| Metric | accuracy |
| Class weight | balanced |

### Fase 2: Fine-Tuning

Pada fase kedua, MobileNetV2 dibuka sebagian. Script melatih ulang 30 layer teratas MobileNetV2 bersama classification head.

| Parameter | Nilai |
|---|---:|
| Epoch maksimum | 80 |
| Optimizer | Adam |
| Learning rate | 0.00001 |
| Layer trainable | 30 layer teratas MobileNetV2 + head |
| Loss | categorical_crossentropy |
| Metric | accuracy |
| Class weight | balanced |

## 12. Penanganan Imbalance

Dataset tidak seimbang, sehingga `ml/train_model.py` menghitung class weight dari distribusi train set:

```python
compute_class_weight(class_weight='balanced', classes=class_ids, y=train_gen.classes)
```

Class weight diterapkan pada fase 1 dan fase 2. Dampaknya, error pada kelas minoritas diberi penalti lebih besar sehingga model tidak hanya mengoptimalkan kelas mayoritas.

## 13. Callback Training

Training memakai callback berikut:

| Callback | Monitor | Fungsi |
|---|---|---|
| EarlyStopping | `val_loss` | Menghentikan training saat validation loss tidak membaik |
| ReduceLROnPlateau | `val_loss` | Menurunkan learning rate saat validation loss stagnan |
| ModelCheckpoint | `val_accuracy` | Menyimpan model terbaik ke `ml/model/rice_disease_model.h5` |

Pada fine-tuning, `ModelCheckpoint` diberi `initial_value_threshold` dari best validation accuracy fase 1, sehingga model fase 2 hanya mengganti artefak jika melampaui performa fase 1.

## 14. Evaluasi Model

Evaluasi dilakukan pada test set yang tidak digunakan saat training.

Output evaluasi:

- Test loss.
- Test accuracy.
- Classification report: precision, recall, F1-score per kelas.
- Confusion matrix.
- Grafik training dan validation accuracy/loss.

Artefak evaluasi:

```text
ml/model/training_history.png
ml/model/confusion_matrix.png
```

Confusion matrix dipakai untuk melihat kelas yang sering tertukar. Ini penting karena beberapa penyakit padi memiliki gejala visual yang mirip, misalnya bercak, perubahan warna daun, atau lesi pada area daun.

## 15. Artefak Model

Artefak utama yang ada:

| Artefak | Fungsi | Ukuran saat ini |
|---|---|---:|
| `ml/model/rice_disease_model.h5` | Model Keras hasil training utama | 25 MB |
| `ml/model/rice_disease.onnx` | Model ONNX untuk runtime browser | 9.9 MB |
| `ml/model/training_history.png` | Grafik training | 112 KB |
| `ml/model/confusion_matrix.png` | Confusion matrix | 160 KB |
| `public/models/rice-disease/model.json` | Artefak TF.js yang sudah ada di public | 100 KB |
| `public/models/rice-disease/group1-shard*.bin` | Weight shards TF.js | total sekitar 10 MB |

Artefak pembanding sebelum cleaning juga masih ada:

- `ml/model/rice_disease_model_before_cleaning.h5`
- `ml/model/training_history_before_cleaning.png`
- `ml/model/confusion_matrix_before_cleaning.png`

## 16. Status Format Model Browser

Implementasi frontend saat ini memakai ONNX Runtime Web:

```ts
import * as ort from 'onnxruntime-web';
```

Loader frontend mencari model di:

```text
/models/rice-disease/model.onnx
```

Namun folder public saat dokumen ini diperbarui berisi artefak TensorFlow.js:

```text
public/models/rice-disease/model.json
public/models/rice-disease/group1-shard1of3.bin
public/models/rice-disease/group1-shard2of3.bin
public/models/rice-disease/group1-shard3of3.bin
```

Sementara file ONNX berada di:

```text
ml/model/rice_disease.onnx
```

Agar fitur deteksi browser berjalan sesuai kode frontend saat ini, salin artefak ONNX ke path public yang diminta loader:

```bash
mkdir -p ../public/models/rice-disease
cp model/rice_disease.onnx ../public/models/rice-disease/model.onnx
```

Perintah di atas dijalankan dari folder `ml/`.

Alternatifnya, jika deployment ingin memakai TensorFlow.js, `resources/js/lib/ml-model.ts` harus diubah dari ONNX Runtime Web menjadi TensorFlow.js loader yang membaca `model.json`. Selama kode frontend masih ONNX, file `model.onnx` wajib tersedia di public.

## 17. Konversi Model

`ml/convert_to_tfjs.py` mengonversi `ml/model/rice_disease_model.h5` ke format TensorFlow.js di `public/models/rice-disease/`. Script ini juga memperbaiki beberapa struktur topology Keras 3 agar kompatibel dengan TF.js.

Output TF.js:

```text
public/models/rice-disease/model.json
public/models/rice-disease/group1-shard*.bin
```

Catatan ONNX:

- `ml/requirements.txt` sudah memuat `tf2onnx`, `onnx`, dan `onnxruntime`.
- File `ml/model/rice_disease.onnx` sudah ada.
- Tidak ada script khusus ONNX di repository saat dokumen ini diperbarui. Jika perlu regenerasi ONNX secara eksplisit, gunakan command `tf2onnx` yang sesuai dengan versi TensorFlow/Keras yang terpasang, lalu verifikasi input shape tetap `[1, 224, 224, 3]`.

Contoh arah command yang perlu disesuaikan dengan environment:

```bash
python -m tf2onnx.convert --keras model/rice_disease_model.h5 --output model/rice_disease.onnx
```

Setelah konversi ONNX, salin ke:

```text
public/models/rice-disease/model.onnx
```

## 18. Integrasi Frontend

File utama frontend adalah `resources/js/lib/ml-model.ts`.

Alur inferensi:

1. `loadModel()` melakukan `HEAD` request ke `/models/rice-disease/model.onnx`.
2. ONNX Runtime Web dikonfigurasi dengan execution provider `wasm`.
3. WASM runtime dimuat dari CDN `onnxruntime-web@1.24.3`.
4. Gambar pengguna digambar ke canvas `224 x 224`.
5. Pixel RGB dinormalisasi dengan `pixel / 127.5 - 1`.
6. Tensor dibuat dengan shape `[1, 224, 224, 3]`.
7. Session ONNX menjalankan inferensi.
8. Probabilitas output dipetakan ke `CLASS_LABELS`.
9. Confidence dibulatkan ke dua desimal.
10. Prediksi diurutkan dari confidence tertinggi ke terendah.

Contoh bentuk output:

```json
[
  { "label": "Blast", "confidence": 92.35 },
  { "label": "Brown Spot", "confidence": 4.18 },
  { "label": "Healthy", "confidence": 1.02 }
]
```

Halaman `resources/js/pages/detection/index.tsx` memakai:

- `loadModel()` untuk memuat model.
- `predict()` untuk inferensi.
- `getTopPrediction()` untuk mengambil hasil utama.

Jika pengguna menyimpan hasil, halaman deteksi mengirim `label`, `confidence`, `method`, gambar, dan data tambahan ke backend.

## 19. Integrasi Backend

Inferensi utama berjalan di browser. Backend tidak menjalankan model untuk flow halaman web utama. Backend berperan untuk:

- Menampilkan halaman deteksi.
- Memvalidasi input hasil deteksi.
- Menyimpan riwayat deteksi.
- Menyediakan data penyakit terkait label prediksi.
- Menampilkan history dan dashboard.

Validasi confidence di backend:

```text
nullable | numeric | min:0 | max:100
```

Endpoint web menyimpan hasil melalui `DetectionController`. Endpoint API private berada di `DetectionApiController`. Mengikuti arsitektur API project, request mutasi harus memakai prefix:

```text
/private/api/v1/
```

## 20. Cara Menjalankan Ulang Pipeline

Setup environment Python:

```bash
cd ml
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Jika data perlu dilabel manual:

```bash
python label_dataset.py
```

Pipeline dataset dan training:

```bash
python clean_dataset.py
python split_dataset.py
python train_model.py
```

Konversi ke TF.js jika ingin menghasilkan artefak `model.json`:

```bash
python convert_to_tfjs.py
```

Deploy ONNX untuk frontend saat ini:

```bash
mkdir -p ../public/models/rice-disease
cp model/rice_disease.onnx ../public/models/rice-disease/model.onnx
```

Kembali ke root project, jalankan test frontend setelah menyentuh file TypeScript:

```bash
npm test
npm run types:check
```

Untuk perubahan dokumentasi saja, test aplikasi tidak wajib secara teknis, tetapi tetap boleh dijalankan jika ingin memastikan tidak ada perubahan samping.

## 21. Checklist Validasi

Checklist saat memperbarui ML:

- `CLASS_NAMES` di `ml/train_model.py` sama dengan `CLASS_LABELS` di `resources/js/lib/ml-model.ts`.
- Folder kelas di `ml/dataset_split/train`, `val`, dan `test` lengkap.
- Preprocessing training dan browser sama-sama memakai `pixel / 127.5 - 1`.
- Output model memiliki 11 probabilitas.
- Shape input ONNX tetap `[1, 224, 224, 3]`.
- File `public/models/rice-disease/model.onnx` tersedia jika frontend memakai ONNX.
- `npm test` lulus untuk test `ml-model`.
- Jika file TypeScript berubah, `npm run types:check` tidak menambah error baru di luar error framer-motion yang sudah diketahui.

## 22. Kelebihan Pendekatan

- MobileNetV2 ringan dibanding banyak CNN besar, sehingga cocok untuk inferensi browser.
- Transfer learning mengurangi kebutuhan data dan waktu training dibanding training dari nol.
- Augmentasi membantu model menghadapi variasi sudut, cahaya, dan posisi daun.
- Balanced class weight membantu kelas minoritas tetap diperhatikan.
- Inferensi browser menjaga gambar pengguna tetap berada di perangkat untuk proses prediksi utama.
- Output probabilitas dapat digabung dengan sistem pakar sebagai pembanding diagnosis.

## 23. Keterbatasan

- Dataset tidak seimbang antar kelas.
- Model hanya mengenali 11 kelas yang ada pada training.
- Foto blur, terlalu gelap, terlalu terang, atau latar belakang kompleks dapat menurunkan confidence.
- Penyakit dengan gejala visual mirip masih bisa tertukar.
- Confidence bukan jaminan kebenaran klinis, melainkan keyakinan model terhadap kelas output.
- Perlu validasi tambahan dengan data lapangan baru dan review pakar pertanian.
- Status artefak public perlu dirapikan agar hanya ada satu format runtime yang menjadi sumber kebenaran.

## 24. Rekomendasi Pengembangan

- Tambah data untuk kelas minoritas, terutama `Bacterial Panicle Blight` dan `Bacterial Leaf Streak`.
- Simpan classification report ke file `.txt` atau `.json` agar metrik training terdokumentasi.
- Tambahkan script ONNX conversion resmi di `ml/` agar pipeline deployment browser reproducible.
- Tambahkan test sederhana yang memverifikasi file model public tersedia pada path yang dipakai frontend.
- Tambahkan threshold confidence, misalnya hasil di bawah nilai tertentu ditandai "perlu verifikasi manual".
- Evaluasi robustness terhadap blur, noise, rotasi ekstrem, pencahayaan rendah, dan background sawah.
- Dokumentasikan sumber dataset dan lisensi jika model akan dipublikasikan.

## 25. Narasi Singkat untuk Laporan

Komponen machine learning pada MAPAN menggunakan metode klasifikasi citra berbasis transfer learning dengan arsitektur MobileNetV2. Dataset citra daun padi disusun dalam 11 kelas, terdiri dari penyakit, hama, dan kondisi sehat. Data dibersihkan dari file rusak serta duplikasi, kemudian dibagi menjadi train, validation, dan test dengan rasio 80:10:10. Citra diproses menjadi ukuran `224 x 224` dan dinormalisasi menggunakan standar MobileNetV2, yaitu `pixel / 127.5 - 1`.

Model dilatih dalam dua fase. Fase pertama melatih classification head dengan base MobileNetV2 yang dibekukan, sedangkan fase kedua melakukan fine-tuning pada 30 layer teratas MobileNetV2. Karena distribusi dataset tidak seimbang, training menggunakan balanced class weight agar kelas minoritas tetap berpengaruh dalam proses pembelajaran. Evaluasi dilakukan pada test set menggunakan accuracy, classification report, confusion matrix, serta grafik training history. Pada aplikasi web, inferensi dirancang berjalan di browser menggunakan ONNX Runtime Web, lalu hasil prediksi berupa label dan confidence dapat disimpan sebagai riwayat deteksi pengguna.
