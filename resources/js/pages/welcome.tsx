import { Head, Link, usePage } from '@inertiajs/react';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Leaf, ScanLine, BrainCircuit, Shield, Zap, Smartphone, ArrowRight, ChevronDown, CheckCircle2, Sparkles, Activity, Eye, Database, Wifi } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { dashboard, login, register } from '@/routes';

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const P = {
    sand: '#DDD8C4',
    sage: '#A3C9A8',
    leaf: '#84B59F',
    teal: '#69A297',
    deep: '#50808E',
} as const;

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
            <Leaf className="text-[#84B59F]/30 dark:text-[#84B59F]/15" style={{ width: size, height: size }} />
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
        { icon: ScanLine, title: 'Deteksi Citra Daun', desc: 'Upload atau ambil foto daun padi langsung dari kamera. Model deep learning menganalisis citra secara instan.', color: P.deep },
        { icon: BrainCircuit, title: 'Sistem Pakar Cerdas', desc: 'Diagnosis penyakit berdasarkan gejala menggunakan metode Forward Chaining dan Certainty Factor.', color: P.teal },
        { icon: Zap, title: 'On-Device ML', desc: 'Model machine learning berjalan langsung di browser. Tidak perlu koneksi server untuk inferensi.', color: P.leaf },
        { icon: Shield, title: 'Akurasi Tinggi', desc: 'Arsitektur MobileNetV2 yang di-fine-tune khusus untuk klasifikasi 5 jenis penyakit padi.', color: P.sage },
        { icon: Smartphone, title: 'Mobile-First', desc: 'Dioptimalkan untuk penggunaan di lapangan. Akses dari smartphone, tablet, atau desktop.', color: P.teal },
        { icon: Database, title: 'Knowledge Base', desc: 'Basis pengetahuan lengkap: penyakit, gejala, penyebab, rekomendasi penanganan, dan dosis.', color: P.deep },
    ];

    const diseases = [
        { name: 'Blast', latin: 'Pyricularia oryzae', color: P.deep },
        { name: 'Brown Spot', latin: 'Bipolaris oryzae', color: P.leaf },
        { name: 'Tungro', latin: 'Rice Tungro Virus', color: P.teal },
        { name: 'BLB', latin: 'Xanthomonas oryzae pv. oryzae', color: P.sage },
        { name: 'Hispa', latin: 'Dicladispa armigera', color: P.deep },
        { name: 'Dead Heart', latin: 'Scirpophaga incertulas', color: P.teal },
        { name: 'Downy Mildew', latin: 'Sclerophthora macrospora', color: P.leaf },
        { name: 'Leaf Streak', latin: 'X. oryzae pv. oryzicola', color: P.sage },
        { name: 'Panicle Blight', latin: 'Burkholderia glumae', color: P.deep },
        { name: 'Leaf Smut', latin: 'Entyloma oryzae', color: P.teal },
        { name: 'Healthy', latin: 'Tanaman Sehat', color: P.sand },
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

            <div className="min-h-screen overflow-x-hidden bg-[#FAFAF7] text-[#1a2e2a] dark:bg-[#0f1a18] dark:text-[#e8f0eb]">
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
                    className="fixed top-0 z-50 w-full border-b border-[#DDD8C4]/40 bg-[#FAFAF7]/70 backdrop-blur-xl dark:border-[#243835]/40 dark:bg-[#0f1a18]/70"
                >
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
                        <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.02 }}>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#50808E] to-[#69A297] shadow-md shadow-[#50808E]/20">
                                <Leaf className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">Mapan</span>
                        </motion.div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Link
                                        href={dashboard()}
                                        className="rounded-xl bg-gradient-to-r from-[#50808E] to-[#69A297] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#50808E]/25 transition-shadow hover:shadow-xl hover:shadow-[#50808E]/30"
                                    >
                                        Dashboard
                                    </Link>
                                </motion.div>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-xl px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#DDD8C4]/40 dark:hover:bg-[#1e2e2b]"
                                    >
                                        Masuk
                                    </Link>
                                    {canRegister && (
                                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                            <Link
                                                href={register()}
                                                className="rounded-xl bg-gradient-to-r from-[#50808E] to-[#69A297] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#50808E]/25 transition-shadow hover:shadow-xl"
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
                    {/* Gradient orbs */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -top-32 right-0 h-[700px] w-[700px] rounded-full bg-gradient-to-br from-[#A3C9A8]/25 to-[#50808E]/10 blur-[100px]"
                        />
                        <motion.div
                            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
                            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#DDD8C4]/30 to-[#84B59F]/15 blur-[80px]"
                        />
                    </div>

                    <div className="relative z-10 mx-auto max-w-6xl px-6">
                        <div className="grid items-center gap-16 lg:grid-cols-2">
                            {/* Left */}
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#A3C9A8]/30 bg-[#A3C9A8]/10 px-4 py-1.5 text-sm font-medium text-[#50808E] dark:text-[#A3C9A8]"
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
                                    <span className="bg-gradient-to-r from-[#50808E] via-[#69A297] to-[#84B59F] bg-clip-text text-transparent">
                                        Mapan
                                    </span>
                                    <br />
                                    <span className="text-3xl font-semibold leading-snug text-[#1a2e2a] sm:text-4xl lg:text-5xl dark:text-[#e8f0eb]">
                                        Deteksi Penyakit Tanaman Padi
                                    </span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                    className="mb-8 max-w-lg text-lg leading-relaxed text-[#5f7a74] dark:text-[#8aa89e]"
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
                                            className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#50808E] to-[#69A297] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-[#50808E]/25 transition-shadow hover:shadow-2xl hover:shadow-[#50808E]/35"
                                        >
                                            {auth.user ? 'Buka Dashboard' : 'Mulai Sekarang'}
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </motion.div>
                                    {!auth.user && (
                                        <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                                            <Link
                                                href={login()}
                                                className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#DDD8C4] px-8 py-4 text-sm font-bold transition-all hover:border-[#84B59F] hover:bg-[#84B59F]/5 dark:border-[#243835] dark:hover:border-[#69A297]"
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
                                            <p className="text-2xl font-bold text-[#50808E] dark:text-[#84B59F]">
                                                <Counter target={stat.value} suffix={stat.suffix} />
                                            </p>
                                            <p className="text-xs text-[#5f7a74] dark:text-[#8aa89e]">{stat.label}</p>
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
                                    {/* Glow behind card */}
                                    <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-[#50808E]/20 to-[#A3C9A8]/20 blur-2xl" />

                                    {/* Main card */}
                                    <motion.div
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                        className="rounded-3xl border border-[#DDD8C4]/50 bg-white/90 p-7 shadow-2xl shadow-[#50808E]/10 backdrop-blur-md dark:border-[#243835]/60 dark:bg-[#162220]/90"
                                    >
                                        <div className="mb-5 flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#50808E] to-[#69A297]">
                                                <ScanLine className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">Hasil Analisis</p>
                                                <p className="text-xs text-[#5f7a74]">Pemindaian selesai - 1.2 detik</p>
                                            </div>
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#84B59F]/15"
                                            >
                                                <CheckCircle2 className="h-4 w-4 text-[#84B59F]" />
                                            </motion.div>
                                        </div>

                                        {/* Animated bars */}
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Healthy', pct: 92, color: `linear-gradient(90deg, ${P.leaf}, ${P.sage})` },
                                                { label: 'Blast', pct: 5, color: `linear-gradient(90deg, ${P.deep}, ${P.teal})` },
                                                { label: 'Brown Spot', pct: 2, color: `linear-gradient(90deg, ${P.teal}, ${P.leaf})` },
                                                { label: 'Tungro', pct: 0.7, color: P.sage },
                                                { label: 'BLB', pct: 0.3, color: P.sand },
                                            ].map((item, i) => (
                                                <motion.div
                                                    key={item.label}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.9 + i * 0.12 }}
                                                >
                                                    <div className="mb-1 flex justify-between text-xs">
                                                        <span className="font-medium">{item.label}</span>
                                                        <span className="font-mono text-[#5f7a74]">{item.pct}%</span>
                                                    </div>
                                                    <div className="h-2.5 overflow-hidden rounded-full bg-[#DDD8C4]/25 dark:bg-[#243835]">
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
                                            className="mt-5 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#84B59F]/10 to-[#50808E]/5 px-5 py-4"
                                        >
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5f7a74]">Tingkat Akurasi</p>
                                                <p className="text-3xl font-black text-[#50808E] dark:text-[#84B59F]">92.0%</p>
                                            </div>
                                            <div className="rounded-xl bg-[#84B59F]/20 px-4 py-2 text-sm font-bold text-[#50808E]">
                                                Sehat
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                    {/* Floating badges */}
                                    <motion.div
                                        animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                        className="absolute -top-5 -right-5 rounded-2xl border border-[#DDD8C4]/50 bg-white px-4 py-2.5 shadow-xl dark:border-[#243835] dark:bg-[#162220]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-[#84B59F]" />
                                            <p className="text-xs font-bold text-[#50808E]">11 Kelas Penyakit</p>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        animate={{ y: [0, 10, 0], rotate: [0, -2, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                                        className="absolute -bottom-5 -left-5 rounded-2xl border border-[#DDD8C4]/50 bg-white px-4 py-2.5 shadow-xl dark:border-[#243835] dark:bg-[#162220]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="h-2 w-2 rounded-full bg-[#69A297]" />
                                            <p className="text-xs font-bold text-[#69A297]">On-Device Processing</p>
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
                                className="flex flex-col items-center gap-1.5 text-[#5f7a74]"
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
                                    className="group relative overflow-hidden rounded-3xl border border-[#DDD8C4]/50 bg-white p-8 transition-shadow hover:shadow-2xl hover:shadow-[#50808E]/8 dark:border-[#243835] dark:bg-[#162220]"
                                >
                                    {/* Background number */}
                                    <span className="absolute -right-4 -top-6 text-[120px] font-black leading-none text-[#DDD8C4]/20 transition-colors group-hover:text-[#84B59F]/15 dark:text-[#243835]/40">
                                        {step.num}
                                    </span>
                                    <div className="relative">
                                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#50808E]/10 to-[#84B59F]/10 transition-colors group-hover:from-[#50808E]/20 group-hover:to-[#84B59F]/20">
                                            <step.icon className="h-7 w-7 text-[#50808E] dark:text-[#84B59F]" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
                                        <p className="text-sm leading-relaxed text-[#5f7a74] dark:text-[#8aa89e]">{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* Features - Interactive carousel                               */}
                {/* ============================================================ */}
                <section className="relative bg-gradient-to-b from-[#f0efe8]/60 to-[#FAFAF7] py-28 dark:from-[#121f1d] dark:to-[#0f1a18]">
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
                                                ? 'border-[#50808E]/30 bg-[#50808E]/5 shadow-lg shadow-[#50808E]/5 dark:border-[#69A297]/30 dark:bg-[#69A297]/5'
                                                : 'border-transparent hover:border-[#DDD8C4]/50 hover:bg-white/50 dark:hover:border-[#243835] dark:hover:bg-[#162220]/50'
                                        }`}
                                    >
                                        <div
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors"
                                            style={{ backgroundColor: activeFeature === i ? `${feature.color}20` : `${P.sand}40` }}
                                        >
                                            <feature.icon className="h-5 w-5" style={{ color: activeFeature === i ? feature.color : P.teal }} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold">{feature.title}</h3>
                                            <AnimatePresence mode="wait">
                                                {activeFeature === i && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="mt-1 text-xs leading-relaxed text-[#5f7a74] dark:text-[#8aa89e]"
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
                                        className="flex h-72 w-full max-w-sm flex-col items-center justify-center rounded-3xl border border-[#DDD8C4]/50 bg-white p-10 shadow-xl dark:border-[#243835] dark:bg-[#162220]"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                            className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
                                            style={{ backgroundColor: `${features[activeFeature].color}15` }}
                                        >
                                            {(() => {
                                                const Icon = features[activeFeature].icon;

                                                return <Icon className="h-10 w-10" style={{ color: features[activeFeature].color }} />;
                                            })()}
                                        </motion.div>
                                        <h3 className="mb-2 text-xl font-bold">{features[activeFeature].title}</h3>
                                        <p className="text-center text-sm text-[#5f7a74] dark:text-[#8aa89e]">{features[activeFeature].desc}</p>
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
                                    className="group relative overflow-hidden rounded-3xl border border-[#DDD8C4]/50 bg-white p-7 text-center shadow-sm transition-shadow hover:shadow-xl hover:shadow-[#50808E]/8 dark:border-[#243835] dark:bg-[#162220]"
                                >
                                    <motion.div
                                        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                                        style={{ backgroundColor: disease.color }}
                                        whileHover={{ rotate: [0, -10, 10, 0] }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Leaf className="h-8 w-8 text-white" />
                                    </motion.div>
                                    <h3 className="mb-1 text-sm font-bold">{disease.name}</h3>
                                    <p className="text-[11px] italic text-[#5f7a74] dark:text-[#8aa89e]">{disease.latin}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* 9 Variables                                                   */}
                {/* ============================================================ */}
                <section className="bg-gradient-to-b from-[#f0efe8]/60 to-[#FAFAF7] py-28 dark:from-[#121f1d] dark:to-[#0f1a18]">
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
                                    className="flex gap-4 rounded-2xl border border-[#DDD8C4]/50 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-[#50808E]/5 dark:border-[#243835] dark:bg-[#162220]"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#50808E] to-[#69A297] text-sm font-black text-white shadow-md shadow-[#50808E]/20">
                                        {v.num}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold">{v.title}</h3>
                                        <p className="text-xs font-semibold text-[#84B59F]">{v.unit}</p>
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
                            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#50808E] via-[#5d8f96] to-[#69A297] p-14 text-center text-white sm:p-20"
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
                                        className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-10 py-5 text-sm font-bold text-[#50808E] shadow-2xl transition-shadow hover:shadow-3xl"
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
                <footer className="border-t border-[#DDD8C4]/40 py-10 dark:border-[#243835]/40">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#50808E] to-[#69A297]">
                                    <Leaf className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-bold">Mapan</span>
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
            <span className="mb-3 inline-block rounded-full bg-[#50808E]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#50808E] dark:text-[#84B59F]">
                {badge}
            </span>
            <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
            {subtitle && (
                <p className="mx-auto mt-4 max-w-2xl text-[#5f7a74] dark:text-[#8aa89e]">{subtitle}</p>
            )}
        </motion.div>
    );
}
