import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Leaf, ScanLine, BrainCircuit, Shield, Zap, Smartphone, ArrowRight, ChevronDown } from 'lucide-react';
import { dashboard, login, register } from '@/routes';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props;

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        }),
    };

    const stagger = {
        visible: { transition: { staggerChildren: 0.1 } },
    };

    const features = [
        {
            icon: ScanLine,
            title: 'Deteksi Citra Daun',
            desc: 'Upload atau ambil foto daun padi langsung dari kamera. Sistem akan menganalisis citra menggunakan model deep learning.',
        },
        {
            icon: BrainCircuit,
            title: 'Sistem Pakar',
            desc: 'Diagnosis penyakit berdasarkan gejala yang diamati menggunakan metode Forward Chaining dan Certainty Factor.',
        },
        {
            icon: Zap,
            title: 'On-Device ML',
            desc: 'Model machine learning berjalan langsung di browser Anda. Tidak perlu koneksi server untuk proses inferensi.',
        },
        {
            icon: Shield,
            title: 'Akurasi Tinggi',
            desc: 'Menggunakan arsitektur MobileNetV2 yang di-fine-tune khusus untuk klasifikasi 5 jenis penyakit padi.',
        },
        {
            icon: Smartphone,
            title: 'Responsif & Mobile',
            desc: 'Dioptimalkan untuk penggunaan di lapangan. Akses dari smartphone, tablet, atau desktop.',
        },
        {
            icon: Leaf,
            title: 'Knowledge Base',
            desc: 'Basis pengetahuan lengkap tentang penyakit padi, gejala, penyebab, dan rekomendasi penanganan beserta dosis.',
        },
    ];

    const diseases = [
        { name: 'Blast', latin: 'Pyricularia oryzae', color: 'bg-[#50808E]' },
        { name: 'Brown Spot', latin: 'Bipolaris oryzae', color: 'bg-[#84B59F]' },
        { name: 'Tungro', latin: 'Rice Tungro Virus', color: 'bg-[#69A297]' },
        { name: 'Bacterial Leaf Blight', latin: 'Xanthomonas oryzae', color: 'bg-[#A3C9A8]' },
        { name: 'Healthy', latin: 'Tanaman Sehat', color: 'bg-[#DDD8C4]' },
    ];

    const steps = [
        { num: '01', title: 'Upload Foto', desc: 'Ambil atau upload foto daun padi yang ingin dianalisis' },
        { num: '02', title: 'Analisis AI', desc: 'Model ML memproses citra dan mendeteksi penyakit secara otomatis' },
        { num: '03', title: 'Hasil & Rekomendasi', desc: 'Dapatkan diagnosis, tingkat akurasi, dan rekomendasi penanganan' },
    ];

    return (
        <>
            <Head title="Sistem Pakar Deteksi Penyakit Tanaman Padi">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-[#FAFAF7] text-[#1a2e2a] dark:bg-[#0f1a18] dark:text-[#e8f0eb]">
                {/* Navbar */}
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed top-0 z-50 w-full border-b border-[#DDD8C4]/50 bg-[#FAFAF7]/80 backdrop-blur-lg dark:border-[#243835]/50 dark:bg-[#0f1a18]/80"
                >
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#50808E]">
                                <Leaf className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-semibold">PadiScan</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-lg bg-[#50808E] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#69A297]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-[#DDD8C4]/50 dark:hover:bg-[#1e2e2b]"
                                    >
                                        Masuk
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="rounded-lg bg-[#50808E] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#69A297]"
                                        >
                                            Daftar
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </motion.nav>

                {/* Hero Section */}
                <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
                    {/* Background decorations */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
                            className="absolute -top-1/4 -right-1/4 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-[#A3C9A8]/20 to-[#50808E]/10 blur-3xl"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
                            className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-[#DDD8C4]/30 to-[#84B59F]/10 blur-3xl"
                        />
                    </div>

                    <div className="relative mx-auto max-w-6xl px-6">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            {/* Left - Text */}
                            <motion.div initial="hidden" animate="visible" variants={stagger}>
                                <motion.div custom={0} variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#A3C9A8]/40 bg-[#A3C9A8]/10 px-4 py-1.5 text-sm font-medium text-[#50808E] dark:text-[#A3C9A8]">
                                    <Zap className="h-3.5 w-3.5" />
                                    On-Device Machine Learning
                                </motion.div>

                                <motion.h1 custom={1} variants={fadeUp} className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                                    Deteksi Penyakit{' '}
                                    <span className="bg-gradient-to-r from-[#50808E] to-[#84B59F] bg-clip-text text-transparent">
                                        Tanaman Padi
                                    </span>{' '}
                                    dengan AI
                                </motion.h1>

                                <motion.p custom={2} variants={fadeUp} className="mb-8 max-w-lg text-lg leading-relaxed text-[#5f7a74] dark:text-[#8aa89e]">
                                    Sistem pakar berbasis machine learning yang berjalan langsung di perangkat Anda.
                                    Identifikasi penyakit padi dari foto daun dan dapatkan rekomendasi penanganan instan.
                                </motion.p>

                                <motion.div custom={3} variants={fadeUp} className="flex flex-wrap gap-4">
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="group inline-flex items-center gap-2 rounded-xl bg-[#50808E] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#50808E]/25 transition-all hover:bg-[#69A297] hover:shadow-xl hover:shadow-[#50808E]/30"
                                        >
                                            Mulai Deteksi
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={register()}
                                                className="group inline-flex items-center gap-2 rounded-xl bg-[#50808E] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#50808E]/25 transition-all hover:bg-[#69A297] hover:shadow-xl hover:shadow-[#50808E]/30"
                                            >
                                                Mulai Sekarang
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <Link
                                                href={login()}
                                                className="inline-flex items-center gap-2 rounded-xl border border-[#DDD8C4] px-7 py-3.5 text-sm font-semibold transition-all hover:border-[#84B59F] hover:bg-[#e8f0eb] dark:border-[#243835] dark:hover:border-[#69A297] dark:hover:bg-[#1e2e2b]"
                                            >
                                                Masuk
                                            </Link>
                                        </>
                                    )}
                                </motion.div>
                            </motion.div>

                            {/* Right - Visual */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="relative hidden lg:block"
                            >
                                <div className="relative mx-auto w-[420px]">
                                    {/* Main card */}
                                    <div className="rounded-2xl border border-[#DDD8C4]/60 bg-white/80 p-6 shadow-2xl shadow-[#50808E]/10 backdrop-blur-sm dark:border-[#243835] dark:bg-[#162220]/80">
                                        {/* Simulated scan result */}
                                        <div className="mb-4 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#50808E]/10">
                                                <ScanLine className="h-5 w-5 text-[#50808E]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">Hasil Analisis</p>
                                                <p className="text-xs text-[#5f7a74]">Pemindaian selesai</p>
                                            </div>
                                        </div>

                                        {/* Fake result bars */}
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Healthy', pct: 92, color: '#84B59F' },
                                                { label: 'Blast', pct: 5, color: '#50808E' },
                                                { label: 'Brown Spot', pct: 2, color: '#A3C9A8' },
                                                { label: 'Tungro', pct: 0.7, color: '#69A297' },
                                                { label: 'BLB', pct: 0.3, color: '#DDD8C4' },
                                            ].map((item, i) => (
                                                <motion.div
                                                    key={item.label}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.8 + i * 0.1 }}
                                                >
                                                    <div className="mb-1 flex justify-between text-xs">
                                                        <span className="font-medium">{item.label}</span>
                                                        <span className="text-[#5f7a74]">{item.pct}%</span>
                                                    </div>
                                                    <div className="h-2 overflow-hidden rounded-full bg-[#DDD8C4]/30 dark:bg-[#243835]">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${item.pct}%` }}
                                                            transition={{ delay: 1 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                                                            className="h-full rounded-full"
                                                            style={{ backgroundColor: item.color }}
                                                        />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Confidence badge */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1.5 }}
                                            className="mt-4 flex items-center justify-between rounded-xl bg-[#84B59F]/10 px-4 py-3"
                                        >
                                            <div>
                                                <p className="text-xs text-[#5f7a74]">Tingkat Akurasi</p>
                                                <p className="text-xl font-bold text-[#50808E]">92.0%</p>
                                            </div>
                                            <div className="rounded-lg bg-[#84B59F]/20 px-3 py-1 text-xs font-semibold text-[#50808E]">
                                                Sehat
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Floating badges */}
                                    <motion.div
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        className="absolute -top-4 -right-4 rounded-xl border border-[#DDD8C4]/60 bg-white px-3 py-2 shadow-lg dark:border-[#243835] dark:bg-[#162220]"
                                    >
                                        <p className="text-xs font-semibold text-[#50808E]">5 Kelas Penyakit</p>
                                    </motion.div>

                                    <motion.div
                                        animate={{ y: [0, 8, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                        className="absolute -bottom-4 -left-4 rounded-xl border border-[#DDD8C4]/60 bg-white px-3 py-2 shadow-lg dark:border-[#243835] dark:bg-[#162220]"
                                    >
                                        <p className="text-xs font-semibold text-[#84B59F]">On-Device Processing</p>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Scroll indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2 }}
                            className="mt-16 flex justify-center lg:mt-24"
                        >
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="flex flex-col items-center gap-1 text-[#5f7a74]"
                            >
                                <span className="text-xs">Scroll</span>
                                <ChevronDown className="h-4 w-4" />
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="relative py-24">
                    <div className="mx-auto max-w-6xl px-6">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-100px' }}
                            variants={stagger}
                            className="mb-16 text-center"
                        >
                            <motion.p custom={0} variants={fadeUp} className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#84B59F]">
                                Cara Kerja
                            </motion.p>
                            <motion.h2 custom={1} variants={fadeUp} className="text-3xl font-bold sm:text-4xl">
                                Tiga Langkah Mudah
                            </motion.h2>
                        </motion.div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={step.num}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15, duration: 0.6 }}
                                    className="group relative rounded-2xl border border-[#DDD8C4]/60 bg-white p-8 transition-all hover:border-[#84B59F]/40 hover:shadow-xl hover:shadow-[#50808E]/5 dark:border-[#243835] dark:bg-[#162220] dark:hover:border-[#69A297]/40"
                                >
                                    <span className="mb-4 block text-4xl font-bold text-[#DDD8C4] transition-colors group-hover:text-[#84B59F] dark:text-[#243835] dark:group-hover:text-[#69A297]">
                                        {step.num}
                                    </span>
                                    <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                                    <p className="text-sm leading-relaxed text-[#5f7a74] dark:text-[#8aa89e]">{step.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="relative bg-[#f0efe8]/50 py-24 dark:bg-[#121f1d]">
                    <div className="mx-auto max-w-6xl px-6">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-100px' }}
                            variants={stagger}
                            className="mb-16 text-center"
                        >
                            <motion.p custom={0} variants={fadeUp} className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#84B59F]">
                                Fitur Unggulan
                            </motion.p>
                            <motion.h2 custom={1} variants={fadeUp} className="text-3xl font-bold sm:text-4xl">
                                Teknologi Terdepan untuk Petani
                            </motion.h2>
                        </motion.div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    whileHover={{ y: -4 }}
                                    className="group rounded-2xl border border-[#DDD8C4]/60 bg-white p-6 transition-shadow hover:shadow-xl hover:shadow-[#50808E]/5 dark:border-[#243835] dark:bg-[#162220]"
                                >
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#50808E]/10 to-[#84B59F]/10 transition-colors group-hover:from-[#50808E]/20 group-hover:to-[#84B59F]/20">
                                        <feature.icon className="h-6 w-6 text-[#50808E] dark:text-[#84B59F]" />
                                    </div>
                                    <h3 className="mb-2 font-semibold">{feature.title}</h3>
                                    <p className="text-sm leading-relaxed text-[#5f7a74] dark:text-[#8aa89e]">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Diseases Section */}
                <section className="py-24">
                    <div className="mx-auto max-w-6xl px-6">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-100px' }}
                            variants={stagger}
                            className="mb-16 text-center"
                        >
                            <motion.p custom={0} variants={fadeUp} className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#84B59F]">
                                Klasifikasi
                            </motion.p>
                            <motion.h2 custom={1} variants={fadeUp} className="text-3xl font-bold sm:text-4xl">
                                5 Kelas Penyakit yang Dideteksi
                            </motion.h2>
                        </motion.div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {diseases.map((disease, i) => (
                                <motion.div
                                    key={disease.name}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08, duration: 0.4 }}
                                    whileHover={{ scale: 1.03 }}
                                    className="group relative overflow-hidden rounded-2xl border border-[#DDD8C4]/60 bg-white p-6 text-center transition-shadow hover:shadow-lg dark:border-[#243835] dark:bg-[#162220]"
                                >
                                    <div className={`mx-auto mb-4 h-14 w-14 rounded-full ${disease.color} flex items-center justify-center`}>
                                        <Leaf className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="mb-1 text-sm font-semibold">{disease.name}</h3>
                                    <p className="text-xs italic text-[#5f7a74] dark:text-[#8aa89e]">{disease.latin}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 9 Variables Section */}
                <section className="bg-[#f0efe8]/50 py-24 dark:bg-[#121f1d]">
                    <div className="mx-auto max-w-6xl px-6">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-100px' }}
                            variants={stagger}
                            className="mb-16 text-center"
                        >
                            <motion.p custom={0} variants={fadeUp} className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#84B59F]">
                                Data Komprehensif
                            </motion.p>
                            <motion.h2 custom={1} variants={fadeUp} className="text-3xl font-bold sm:text-4xl">
                                9 Variabel Pemindaian
                            </motion.h2>
                            <motion.p custom={2} variants={fadeUp} className="mx-auto mt-4 max-w-2xl text-[#5f7a74] dark:text-[#8aa89e]">
                                Setiap pemindaian mencatat 9 variabel penting untuk analisis yang komprehensif
                            </motion.p>
                        </motion.div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { num: '1', title: 'Citra Daun', unit: 'JPEG / PNG', desc: 'Foto daun padi yang dianalisis' },
                                { num: '2', title: 'Label Penyakit', unit: 'Teks', desc: 'Nama penyakit yang terdeteksi' },
                                { num: '3', title: 'Tingkat Akurasi', unit: 'Persen (%)', desc: 'Confidence level prediksi model' },
                                { num: '4', title: 'Suhu', unit: 'Derajat Celsius (°C)', desc: 'Suhu lingkungan saat pemindaian' },
                                { num: '5', title: 'Waktu Pemindaian', unit: 'Datetime + ms', desc: 'Timestamp dan durasi proses' },
                                { num: '6', title: 'Titik Koordinat', unit: 'Lat, Long', desc: 'Lokasi GPS pemindaian' },
                                { num: '7', title: 'Status Koneksi', unit: 'Online / Offline', desc: 'Status jaringan perangkat' },
                                { num: '8', title: 'Rekomendasi Tindakan', unit: 'Teks', desc: 'Saran penanganan penyakit' },
                                { num: '9', title: 'Dosis', unit: 'ml/L, kg/ha, gram/L', desc: 'Dosis obat/pupuk yang direkomendasikan' },
                            ].map((v, i) => (
                                <motion.div
                                    key={v.num}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05, duration: 0.4 }}
                                    className="flex gap-4 rounded-xl border border-[#DDD8C4]/60 bg-white p-5 dark:border-[#243835] dark:bg-[#162220]"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#50808E] text-sm font-bold text-white">
                                        {v.num}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold">{v.title}</h3>
                                        <p className="text-xs font-medium text-[#84B59F]">{v.unit}</p>
                                        <p className="mt-1 text-xs text-[#5f7a74] dark:text-[#8aa89e]">{v.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24">
                    <div className="mx-auto max-w-6xl px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#50808E] to-[#69A297] p-12 text-center text-white sm:p-16"
                        >
                            {/* Decorative circles */}
                            <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10" />
                            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10" />

                            <div className="relative">
                                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                                    Siap Melindungi Tanaman Padi Anda?
                                </h2>
                                <p className="mx-auto mb-8 max-w-xl text-white/80">
                                    Mulai gunakan sistem pakar deteksi penyakit padi berbasis AI sekarang.
                                    Gratis dan berjalan langsung di perangkat Anda.
                                </p>
                                <Link
                                    href={auth.user ? dashboard() : register()}
                                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-[#50808E] shadow-lg transition-all hover:shadow-xl"
                                >
                                    {auth.user ? 'Buka Dashboard' : 'Daftar Gratis'}
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-[#DDD8C4]/50 py-8 dark:border-[#243835]/50">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#50808E]">
                                    <Leaf className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-semibold">PadiScan</span>
                            </div>
                            <p className="text-xs text-[#5f7a74] dark:text-[#8aa89e]">
                                Sistem Pakar Deteksi Penyakit Tanaman Padi Berbasis On-Device Machine Learning
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
