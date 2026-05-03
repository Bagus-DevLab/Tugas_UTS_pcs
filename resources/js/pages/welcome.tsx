import { Head, Link, usePage } from '@inertiajs/react';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Leaf, ScanLine, BrainCircuit, Shield, Zap, Smartphone, ArrowRight, ChevronDown, CheckCircle2, Sparkles, Activity, Eye, Database, Wifi } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { dashboard, login, register } from '@/routes';

// ---------------------------------------------------------------------------
// Tailwind slate + emerald palette — no custom hex needed
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Animated counter component
// ---------------------------------------------------------------------------
function Counter({ target, suffix = '', duration = 2 }: { target: number; suffix?: string; duration?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const motionVal = useMotionValue(0);
    const spring = useSpring(motionVal, { duration: duration * 1000 });
    const [display, setDisplay] = useState('0');

    useEffect(() => {
        if (isInView) {
motionVal.set(target);
}
    }, [isInView, motionVal, target]);

    useEffect(() => {
        const unsub = spring.on('change', (v) => {
            setDisplay(Math.round(v).toString());
        });

        return unsub;
    }, [spring]);

    return (
        <span ref={ref}>
            {display}
            {suffix}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Floating particle
// ---------------------------------------------------------------------------
function FloatingLeaf({ delay, x, size, speed }: { delay: number; x: number; size: number; speed: number }) {
    return (
        <motion.div
            className="pointer-events-none absolute top-0"
            style={{ left: `${x}%` }}
            initial={{ y: -40, opacity: 0, rotate: 0 }}
            animate={{
                y: ['0vh', '105vh'],
                opacity: [0, 0.6, 0.6, 0],
                rotate: [0, 180, 360],
            }}
            transition={{
                duration: speed,
                delay,
                repeat: Infinity,
                ease: 'linear',
            }}
        >
            <Leaf className="text-emerald-500/20" style={{ width: size, height: size }} />
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props;
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

    const [activeFeature, setActiveFeature] = useState(0);

    // Auto-rotate features
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 6);
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    // -----------------------------------------------------------------------
    // Data
    // -----------------------------------------------------------------------
    const features = [
        { icon: ScanLine, title: 'Deteksi Citra Daun', desc: 'Upload atau ambil foto daun padi langsung dari kamera. Model deep learning menganalisis citra secara instan.' },
        { icon: BrainCircuit, title: 'Sistem Pakar Cerdas', desc: 'Diagnosis penyakit berdasarkan gejala menggunakan metode Forward Chaining dan Certainty Factor.' },
        { icon: Zap, title: 'On-Device ML', desc: 'Model machine learning berjalan langsung di browser. Tidak perlu koneksi server untuk inferensi.' },
        { icon: Shield, title: 'Akurasi Tinggi', desc: 'Arsitektur MobileNetV2 yang di-fine-tune khusus untuk klasifikasi 5 jenis penyakit padi.' },
        { icon: Smartphone, title: 'Mobile-First', desc: 'Dioptimalkan untuk penggunaan di lapangan. Akses dari smartphone, tablet, atau desktop.' },
        { icon: Database, title: 'Knowledge Base', desc: 'Basis pengetahuan lengkap: penyakit, gejala, penyebab, rekomendasi penanganan, dan dosis.' },
    ];

    const diseases = [
        { name: 'Blast', latin: 'Pyricularia oryzae' },
        { name: 'Brown Spot', latin: 'Bipolaris oryzae' },
        { name: 'Tungro', latin: 'Rice Tungro Virus' },
        { name: 'BLB', latin: 'Xanthomonas oryzae pv. oryzae' },
        { name: 'Hispa', latin: 'Dicladispa armigera' },
        { name: 'Dead Heart', latin: 'Scirpophaga incertulas' },
        { name: 'Downy Mildew', latin: 'Sclerophthora macrospora' },
        { name: 'Leaf Streak', latin: 'X. oryzae pv. oryzicola' },
        { name: 'Panicle Blight', latin: 'Burkholderia glumae' },
        { name: 'Leaf Smut', latin: 'Entyloma oryzae' },
        { name: 'Healthy', latin: 'Tanaman Sehat' },
    ];

    const variables = [
        { num: '1', title: 'Citra Daun', unit: 'JPEG / PNG', icon: Eye },
        { num: '2', title: 'Label Penyakit', unit: 'Teks', icon: Activity },
        { num: '3', title: 'Tingkat Akurasi', unit: 'Persen (%)', icon: Sparkles },
        { num: '4', title: 'Suhu', unit: '°C', icon: Activity },
        { num: '5', title: 'Waktu Pemindaian', unit: 'Datetime + ms', icon: ScanLine },
        { num: '6', title: 'Titik Koordinat', unit: 'Lat, Long', icon: Database },
        { num: '7', title: 'Status Koneksi', unit: 'Online / Offline', icon: Wifi },
        { num: '8', title: 'Rekomendasi', unit: 'Teks', icon: Shield },
        { num: '9', title: 'Dosis', unit: 'ml/L, kg/ha', icon: Activity },
    ];

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------
    return (
        <>
            <Head title="Mapan - Sistem Pakar Deteksi Penyakit Tanaman Padi">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
                {/* Floating leaves background */}
                <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                    {[
                        { x: 12, speed: 14 }, { x: 28, speed: 17 }, { x: 45, speed: 13 },
                        { x: 62, speed: 19 }, { x: 78, speed: 15 }, { x: 88, speed: 16 },
                    ].map((leaf, i) => (
                        <FloatingLeaf key={i} delay={i * 2.5} x={leaf.x} size={14 + i * 3} speed={leaf.speed} />
                    ))}
                </div>

                {/* ============================================================ */}
                {/* Navbar                                                        */}
                {/* ============================================================ */}
                <motion.nav
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm"
                >
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
                        <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.02 }}>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 shadow-md">
                                <Leaf className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">Mapan</span>
                        </motion.div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Link
                                        href={dashboard()}
                                        className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg"
                                    >
                                        Dashboard
                                    </Link>
                                </motion.div>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
                                    >
                                        Masuk
                                    </Link>
                                    {canRegister && (
                                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                            <Link
                                                href={register()}
                                                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg"
                                            >
                                                Daftar
                                            </Link>
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </motion.nav>

                {/* ============================================================ */}
                {/* Hero                                                          */}
                {/* ============================================================ */}
                <motion.section
                    ref={heroRef}
                    style={{ opacity: heroOpacity, scale: heroScale }}
                    className="relative flex min-h-screen items-center pt-20"
                >
                    {/* Subtle gradient background */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />

                    <div className="relative z-10 mx-auto max-w-6xl px-6">
                        <div className="grid items-center gap-16 lg:grid-cols-2">
                            {/* Left */}
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700"
                                >
                                    <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                                        <Sparkles className="h-3.5 w-3.5" />
                                    </motion.div>
                                    On-Device Machine Learning
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                    className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
                                >
                                    <span className="text-emerald-600">
                                        Mapan
                                    </span>
                                    <br />
                                    <span className="text-3xl font-semibold leading-snug text-slate-900 sm:text-4xl lg:text-5xl">
                                        Deteksi Penyakit Tanaman Padi
                                    </span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                    className="mb-8 max-w-lg text-lg leading-relaxed text-slate-600"
                                >
                                    Sistem pakar berbasis AI yang berjalan langsung di perangkat Anda.
                                    Identifikasi penyakit padi dari foto daun dan dapatkan rekomendasi penanganan instan.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.65, duration: 0.6 }}
                                    className="flex flex-wrap gap-4"
                                >
                                    <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                                        <Link
                                            href={auth.user ? dashboard() : register()}
                                            className="group inline-flex items-center gap-2.5 rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg"
                                        >
                                            {auth.user ? 'Buka Dashboard' : 'Mulai Sekarang'}
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </motion.div>
                                    {!auth.user && (
                                        <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                                            <Link
                                                href={login()}
                                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
                                            >
                                                Masuk
                                            </Link>
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Stats row */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.9, duration: 0.6 }}
                                    className="mt-12 flex gap-8"
                                >
                                    {[
                                        { value: 11, suffix: '', label: 'Kelas Penyakit' },
                                        { value: 47, suffix: '', label: 'Gejala Terdeteksi' },
                                        { value: 9, suffix: '', label: 'Variabel Data' },
                                    ].map((stat, i) => (
                                        <div key={i}>
                                            <p className="text-2xl font-bold text-slate-900">
                                                <Counter target={stat.value} suffix={stat.suffix} />
                                            </p>
                                            <p className="text-xs text-slate-500">{stat.label}</p>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>

                            {/* Right - Interactive card */}
                            <motion.div
                                initial={{ opacity: 0, x: 60 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="relative hidden lg:block"
                            >
                                <div className="relative mx-auto w-[430px]">
                                    {/* Subtle shadow behind card */}
                                    <div className="absolute inset-0 -z-10 rounded-3xl bg-slate-200/50 blur-2xl" />

                                    {/* Main card */}
                                    <motion.div
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                        className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xl"
                                    >
                                        <div className="mb-5 flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600">
                                                <ScanLine className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Hasil Analisis</p>
                                                <p className="text-xs text-slate-500">Pemindaian selesai - 1.2 detik</p>
                                            </div>
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50"
                                            >
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            </motion.div>
                                        </div>

                                        {/* Animated bars */}
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Healthy', pct: 92, color: '#10b981' },
                                                { label: 'Blast', pct: 5, color: '#64748b' },
                                                { label: 'Brown Spot', pct: 2, color: '#94a3b8' },
                                                { label: 'Tungro', pct: 0.7, color: '#cbd5e1' },
                                                { label: 'BLB', pct: 0.3, color: '#e2e8f0' },
                                            ].map((item, i) => (
                                                <motion.div
                                                    key={item.label}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.9 + i * 0.12 }}
                                                >
                                                    <div className="mb-1 flex justify-between text-xs">
                                                        <span className="font-medium text-slate-700">{item.label}</span>
                                                        <span className="font-mono text-slate-500">{item.pct}%</span>
                                                    </div>
                                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                                        <motion.div
                                                            className="h-full rounded-full"
                                                            style={{ background: item.color }}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${item.pct}%` }}
                                                            transition={{ delay: 1.2 + i * 0.12, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                                        />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Result badge */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1.8, type: 'spring', stiffness: 200 }}
                                            className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4"
                                        >
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tingkat Akurasi</p>
                                                <p className="text-3xl font-black text-slate-900">92.0%</p>
                                            </div>
                                            <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                                                Sehat
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                    {/* Floating badges */}
                                    <motion.div
                                        animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                        className="absolute -top-5 -right-5 rounded-2xl border border-slate-100 bg-white px-4 py-2.5 shadow-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <p className="text-xs font-bold text-slate-700">11 Kelas Penyakit</p>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        animate={{ y: [0, 10, 0], rotate: [0, -2, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                                        className="absolute -bottom-5 -left-5 rounded-2xl border border-slate-100 bg-white px-4 py-2.5 shadow-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <p className="text-xs font-bold text-emerald-700">On-Device Processing</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Scroll indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.5 }}
                            className="mt-16 flex justify-center lg:mt-20"
                        >
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="flex flex-col items-center gap-1.5 text-slate-400"
                            >
                                <span className="text-[10px] font-medium uppercase tracking-widest">Scroll</span>
                                <ChevronDown className="h-4 w-4" />
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* ============================================================ */}
                {/* How It Works - Horizontal steps                               */}
                {/* ============================================================ */}
                <section className="relative py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <SectionHeader badge="Cara Kerja" title="Tiga Langkah Mudah" />

                        <div className="grid gap-6 md:grid-cols-3">
                            {[
                                { num: '01', title: 'Upload Foto', desc: 'Ambil atau upload foto daun padi yang ingin dianalisis', icon: ScanLine },
                                { num: '02', title: 'Analisis AI', desc: 'Model ML memproses citra dan mendeteksi penyakit secara otomatis', icon: BrainCircuit },
                                { num: '03', title: 'Hasil & Rekomendasi', desc: 'Dapatkan diagnosis, tingkat akurasi, dan rekomendasi penanganan', icon: CheckCircle2 },
                            ].map((step, i) => (
                                <motion.div
                                    key={step.num}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-xl"
                                >
                                    {/* Background number */}
                                    <span className="absolute -right-4 -top-6 text-[120px] font-black leading-none text-slate-100 transition-colors group-hover:text-emerald-50">
                                        {step.num}
                                    </span>
                                    <div className="relative">
                                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 transition-colors group-hover:bg-emerald-100">
                                            <step.icon className="h-7 w-7 text-emerald-600" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-bold text-slate-900">{step.title}</h3>
                                        <p className="text-sm leading-relaxed text-slate-600">{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* Features - Interactive carousel                               */}
                {/* ============================================================ */}
                <section className="relative bg-slate-50 py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <SectionHeader badge="Fitur Unggulan" title="Teknologi Terdepan untuk Petani" />

                        <div className="grid gap-8 lg:grid-cols-2">
                            {/* Left - Feature list */}
                            <div className="space-y-3">
                                {features.map((feature, i) => (
                                    <motion.button
                                        key={feature.title}
                                        onClick={() => setActiveFeature(i)}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.08 }}
                                        className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-all ${
                                            activeFeature === i
                                                ? 'border-emerald-200 bg-emerald-50 shadow-md'
                                                : 'border-transparent hover:border-slate-200 hover:bg-white'
                                        }`}
                                    >
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                                activeFeature === i ? 'bg-emerald-100' : 'bg-slate-100'
                                            }`}
                                        >
                                            <feature.icon className={`h-5 w-5 ${activeFeature === i ? 'text-emerald-600' : 'text-slate-500'}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">{feature.title}</h3>
                                            <AnimatePresence mode="wait">
                                                {activeFeature === i && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="mt-1 text-xs leading-relaxed text-slate-600"
                                                    >
                                                        {feature.desc}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Right - Feature visual */}
                            <div className="flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeFeature}
                                        initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        className="flex h-72 w-full max-w-sm flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-lg"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                            className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50"
                                        >
                                            {(() => {
                                                const Icon = features[activeFeature].icon;

                                                return <Icon className="h-10 w-10 text-emerald-600" />;
                                            })()}
                                        </motion.div>
                                        <h3 className="mb-2 text-xl font-bold text-slate-900">{features[activeFeature].title}</h3>
                                        <p className="text-center text-sm text-slate-600">{features[activeFeature].desc}</p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* Diseases                                                      */}
                {/* ============================================================ */}
                <section className="py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <SectionHeader badge="Klasifikasi" title="11 Kelas Penyakit yang Dideteksi" />

                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {diseases.map((disease, i) => (
                                <motion.div
                                    key={disease.name}
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.25 } }}
                                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm transition-shadow hover:shadow-lg"
                                >
                                    <motion.div
                                        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600"
                                        whileHover={{ rotate: [0, -10, 10, 0] }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Leaf className="h-8 w-8 text-white" />
                                    </motion.div>
                                    <h3 className="mb-1 text-sm font-bold text-slate-900">{disease.name}</h3>
                                    <p className="text-[11px] italic text-slate-500">{disease.latin}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* 9 Variables                                                   */}
                {/* ============================================================ */}
                <section className="bg-slate-50 py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <SectionHeader
                            badge="Data Komprehensif"
                            title="9 Variabel Pemindaian"
                            subtitle="Setiap pemindaian mencatat 9 variabel penting untuk analisis yang komprehensif"
                        />

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {variables.map((v, i) => (
                                <motion.div
                                    key={v.num}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05, duration: 0.4 }}
                                    whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.2 } }}
                                    className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white shadow-md">
                                        {v.num}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">{v.title}</h3>
                                        <p className="text-xs font-semibold text-emerald-600">{v.unit}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* CTA                                                           */}
                {/* ============================================================ */}
                <section className="py-28">
                    <div className="mx-auto max-w-6xl px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="relative overflow-hidden rounded-[2rem] bg-emerald-600 p-14 text-center text-white sm:p-20"
                        >
                            {/* Decorative */}
                            <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
                            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-xl" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                                className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
                            />

                            <div className="relative">
                                <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
                                >
                                    <Leaf className="h-8 w-8" />
                                </motion.div>
                                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                                    Siap Melindungi Tanaman Padi?
                                </h2>
                                <p className="mx-auto mb-10 max-w-xl text-white/75">
                                    Mulai gunakan Mapan sekarang. Gratis dan berjalan langsung di perangkat Anda.
                                </p>
                                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                                    <Link
                                        href={auth.user ? dashboard() : register()}
                                        className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-10 py-5 text-sm font-bold text-emerald-700 shadow-xl transition-all hover:shadow-2xl"
                                    >
                                        {auth.user ? 'Buka Dashboard' : 'Daftar Gratis'}
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* Footer                                                        */}
                {/* ============================================================ */}
                <footer className="border-t border-slate-200 bg-slate-50 py-10">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                                    <Leaf className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-bold text-slate-900">Mapan</span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Sistem Pakar Deteksi Penyakit Tanaman Padi Berbasis On-Device Machine Learning
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

// ---------------------------------------------------------------------------
// Section header component
// ---------------------------------------------------------------------------
function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mb-14 text-center"
        >
            <span className="mb-3 inline-block rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-700">
                {badge}
            </span>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h2>
            {subtitle && (
                <p className="mx-auto mt-4 max-w-2xl text-slate-600">{subtitle}</p>
            )}
        </motion.div>
    );
}
