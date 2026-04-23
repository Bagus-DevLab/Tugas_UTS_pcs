import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, MapPin, Thermometer, Clock, Wifi, WifiOff, Image as ImageIcon, FlaskConical, Pill, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// Color palette
const palette = {
    sand: '#DDD8C4',
    sage: '#A3C9A8',
    leaf: '#84B59F',
    teal: '#69A297',
    deep: '#50808E',
};

interface Treatment {
    id: number;
    type: string;
    description: string;
    dosage: string | null;
    dosage_unit: string | null;
    priority: number;
}

interface Symptom {
    id: number;
    code: string;
    name: string;
}

interface Disease {
    id: number;
    name: string;
    slug: string;
    latin_name: string | null;
    description: string;
    symptoms?: Symptom[];
    treatments?: Treatment[];
}

interface Detection {
    id: number;
    method: 'image' | 'expert_system';
    image_path: string | null;
    label: string | null;
    confidence: number | null;
    temperature: number | null;
    scanned_at: string | null;
    scan_duration_ms: number | null;
    latitude: number | null;
    longitude: number | null;
    connection_status: string;
    predictions: Record<string, number> | null;
    selected_symptoms: number[] | null;
    notes: string | null;
    created_at: string;
    disease?: Disease | null;
}

interface Props {
    detection: Detection;
}

function formatDateTime(dateString: string): string {
    const date = new Date(dateString);

    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function formatDuration(ms: number | null): string {
    if (ms === null) {
return '-';
}

    if (ms < 1000) {
return `${ms} ms`;
}

    return `${(ms / 1000).toFixed(2)} detik`;
}

function formatConfidencePercent(confidence: number | null): number {
    if (confidence === null) {
return 0;
}

    return Math.round(Number(confidence) * 10) / 10;
}

function getTreatmentTypeLabel(type: string): string {
    switch (type) {
        case 'chemical':
            return 'Kimia';
        case 'biological':
            return 'Biologis';
        case 'cultural':
            return 'Kultur';
        case 'mechanical':
            return 'Mekanis';
        default:
            return type;
    }
}

// Animation variants
const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.15 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 28 },
    },
};

const barVariants = {
    hidden: { width: 0 },
    visible: (percent: number) => ({
        width: `${Math.min(percent, 100)}%`,
        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 },
    }),
};

export default function DetectionShow({ detection }: Props) {
    const confidencePercent = formatConfidencePercent(detection.confidence);
    const sortedPredictions = detection.predictions
        ? Object.entries(detection.predictions).sort(([, a], [, b]) => b - a)
        : [];
    const maxPrediction = sortedPredictions.length > 0 ? sortedPredictions[0][1] : 0;

    const matchedSymptoms = detection.disease?.symptoms?.filter((s) =>
        detection.selected_symptoms?.includes(s.id),
    );

    const treatments = detection.disease?.treatments
        ? [...detection.disease.treatments].sort((a, b) => a.priority - b.priority)
        : [];

    return (
        <>
            <Head title={`Deteksi #${detection.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Back Button & Header */}
                <motion.div
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                    <Button variant="outline" size="icon" asChild style={{ borderColor: palette.teal, color: palette.teal }}>
                        <Link href="/detection/history">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: palette.deep }}>
                            Detail Deteksi
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            ID #{detection.id} &middot; {detection.method === 'image' ? 'Deteksi Citra' : 'Sistem Pakar'}
                        </p>
                    </div>
                </motion.div>

                {/* Main Grid - 9 Variables */}
                <motion.div
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                    variants={cardContainerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* 1. Citra Daun */}
                    <motion.div className="md:row-span-2" variants={cardVariants}>
                        <Card className="h-full border" style={{ borderColor: `${palette.sand}` }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm" style={{ color: palette.deep }}>
                                    <ImageIcon className="size-4" style={{ color: palette.teal }} />
                                    Citra Daun
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {detection.image_path ? (
                                    <motion.div
                                        className="overflow-hidden rounded-lg border"
                                        style={{ borderColor: palette.sage }}
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    >
                                        <img
                                            src={`/storage/${detection.image_path}`}
                                            alt="Citra daun padi"
                                            className="aspect-square w-full object-cover"
                                        />
                                    </motion.div>
                                ) : (
                                    <div
                                        className="flex aspect-square items-center justify-center rounded-lg border border-dashed"
                                        style={{ borderColor: palette.sand, backgroundColor: `${palette.sand}22` }}
                                    >
                                        <div className="text-center">
                                            <ImageIcon className="mx-auto mb-2 size-10" style={{ color: `${palette.teal}55` }} />
                                            <p className="text-sm text-muted-foreground">
                                                Tidak ada citra
                                            </p>
                                            <p className="text-xs text-muted-foreground/70">
                                                Deteksi menggunakan sistem pakar
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* 2. Label Penyakit */}
                    <motion.div className="md:col-span-1 lg:col-span-2" variants={cardVariants}>
                        <Card className="h-full border" style={{ borderColor: `${palette.sand}` }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm" style={{ color: palette.deep }}>
                                    <FlaskConical className="size-4" style={{ color: palette.teal }} />
                                    Label Penyakit
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h2 className="text-2xl font-bold tracking-tight" style={{ color: palette.deep }}>
                                    {detection.disease?.name || detection.label || 'Tidak Terdeteksi'}
                                </h2>
                                {detection.disease?.latin_name && (
                                    <p className="mt-1 text-sm italic" style={{ color: palette.teal }}>
                                        {detection.disease.latin_name}
                                    </p>
                                )}
                                {detection.disease?.description && (
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                        {detection.disease.description}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* 3. Tingkat Akurasi */}
                    <motion.div variants={cardVariants}>
                        <Card className="h-full border" style={{ borderColor: `${palette.sand}` }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm" style={{ color: palette.deep }}>
                                    <Activity className="size-4" style={{ color: palette.teal }} />
                                    Tingkat Akurasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {detection.confidence !== null ? (
                                    <div>
                                        <div className="mb-2 flex items-baseline gap-1">
                                            <motion.span
                                                className="text-3xl font-bold tabular-nums"
                                                style={{ color: palette.deep }}
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                                            >
                                                {confidencePercent}
                                            </motion.span>
                                            <span className="text-lg text-muted-foreground">%</span>
                                        </div>
                                        <div className="h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: `${palette.sand}88` }}>
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        confidencePercent >= 80
                                                            ? palette.sage
                                                            : confidencePercent >= 50
                                                              ? palette.teal
                                                              : '#c47a7a',
                                                }}
                                                variants={barVariants}
                                                initial="hidden"
                                                animate="visible"
                                                custom={confidencePercent}
                                            />
                                        </div>
                                        <p className="mt-1.5 text-xs text-muted-foreground">
                                            {confidencePercent >= 80
                                                ? 'Tingkat kepercayaan tinggi'
                                                : confidencePercent >= 50
                                                  ? 'Tingkat kepercayaan sedang'
                                                  : 'Tingkat kepercayaan rendah'}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Tidak tersedia</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* 4. Suhu */}
                    <motion.div variants={cardVariants}>
                        <Card className="h-full border" style={{ borderColor: `${palette.sand}` }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm" style={{ color: palette.deep }}>
                                    <Thermometer className="size-4" style={{ color: palette.teal }} />
                                    Suhu
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {detection.temperature !== null ? (
                                    <div className="flex items-baseline gap-1">
                                        <motion.span
                                            className="text-3xl font-bold tabular-nums"
                                            style={{ color: palette.deep }}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                                        >
                                            {Number(detection.temperature).toFixed(1)}
                                        </motion.span>
                                        <span className="text-lg text-muted-foreground">°C</span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Tidak tersedia</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* 5. Waktu Pemindaian */}
                    <motion.div variants={cardVariants}>
                        <Card className="h-full border" style={{ borderColor: `${palette.sand}` }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm" style={{ color: palette.deep }}>
                                    <Clock className="size-4" style={{ color: palette.teal }} />
                                    Waktu Pemindaian
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm font-medium" style={{ color: palette.deep }}>
                                    {formatDateTime(detection.scanned_at || detection.created_at)}
                                </p>
                                {detection.scan_duration_ms !== null && (
                                    <p className="mt-1.5 text-sm text-muted-foreground">
                                        Durasi: {formatDuration(detection.scan_duration_ms)}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* 6. Titik Koordinat */}
                    <motion.div variants={cardVariants}>
                        <Card className="h-full border" style={{ borderColor: `${palette.sand}` }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm" style={{ color: palette.deep }}>
                                    <MapPin className="size-4" style={{ color: palette.teal }} />
                                    Titik Koordinat
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {detection.latitude !== null && detection.longitude !== null ? (
                                    <div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted-foreground">Lat:</span>
                                                <span className="font-mono font-medium" style={{ color: palette.deep }}>
                                                    {Number(detection.latitude).toFixed(6)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted-foreground">Long:</span>
                                                <span className="font-mono font-medium" style={{ color: palette.deep }}>
                                                    {Number(detection.longitude).toFixed(6)}
                                                </span>
                                            </div>
                                        </div>
                                        <a
                                            href={`https://www.google.com/maps?q=${detection.latitude},${detection.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
                                            style={{ color: palette.teal }}
                                        >
                                            Buka di Google Maps
                                            <ExternalLink className="size-3" />
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Tidak tersedia</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* 7. Status Koneksi */}
                    <motion.div variants={cardVariants}>
                        <Card className="h-full border" style={{ borderColor: `${palette.sand}` }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm" style={{ color: palette.deep }}>
                                    {detection.connection_status === 'online' ? (
                                        <Wifi className="size-4" style={{ color: palette.sage }} />
                                    ) : (
                                        <WifiOff className="size-4" style={{ color: '#b45555' }} />
                                    )}
                                    Status Koneksi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge
                                    className="text-sm text-white"
                                    style={{
                                        backgroundColor:
                                            detection.connection_status === 'online'
                                                ? palette.sage
                                                : '#b45555',
                                    }}
                                >
                                    <motion.span
                                        className="mr-1.5 inline-block size-2 rounded-full"
                                        style={{
                                            backgroundColor:
                                                detection.connection_status === 'online'
                                                    ? '#d4edda'
                                                    : '#f5c6cb',
                                        }}
                                        animate={
                                            detection.connection_status === 'online'
                                                ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }
                                                : {}
                                        }
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    />
                                    {detection.connection_status === 'online' ? 'Online' : 'Offline'}
                                </Badge>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* 8. Rekomendasi Tindakan */}
                    <motion.div className="md:col-span-2 lg:col-span-3" variants={cardVariants}>
                        <Card className="border" style={{ borderColor: `${palette.sand}` }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm" style={{ color: palette.deep }}>
                                    <FlaskConical className="size-4" style={{ color: palette.teal }} />
                                    Rekomendasi Tindakan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {treatments.length > 0 ? (
                                    <div className="space-y-3">
                                        {treatments.map((treatment, index) => (
                                            <motion.div
                                                key={treatment.id}
                                                className="flex gap-3 rounded-lg border p-3"
                                                style={{ borderColor: `${palette.sage}66` }}
                                                initial={{ opacity: 0, x: -12 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.6 + index * 0.08, type: 'spring', stiffness: 300, damping: 28 }}
                                                whileHover={{ backgroundColor: `${palette.sage}12`, transition: { duration: 0.15 } }}
                                            >
                                                <div
                                                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                                    style={{ backgroundColor: palette.teal }}
                                                >
                                                    {index + 1}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                            style={{ borderColor: palette.leaf, color: palette.deep }}
                                                        >
                                                            {getTreatmentTypeLabel(treatment.type)}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm leading-relaxed">
                                                        {treatment.description}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada rekomendasi tindakan untuk penyakit ini.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* 9. Dosis */}
                    <motion.div className="md:col-span-2 lg:col-span-3" variants={cardVariants}>
                        <Card className="border" style={{ borderColor: `${palette.sand}` }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm" style={{ color: palette.deep }}>
                                    <Pill className="size-4" style={{ color: palette.teal }} />
                                    Dosis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {treatments.filter((t) => t.dosage).length > 0 ? (
                                    <div className="overflow-hidden rounded-lg border" style={{ borderColor: `${palette.sage}66` }}>
                                        <Table>
                                            <TableHeader>
                                                <TableRow style={{ backgroundColor: `${palette.sand}33` }}>
                                                    <TableHead style={{ color: palette.deep }}>No</TableHead>
                                                    <TableHead style={{ color: palette.deep }}>Tindakan</TableHead>
                                                    <TableHead style={{ color: palette.deep }}>Jenis</TableHead>
                                                    <TableHead style={{ color: palette.deep }}>Dosis</TableHead>
                                                    <TableHead style={{ color: palette.deep }}>Satuan</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {treatments
                                                    .filter((t) => t.dosage)
                                                    .map((treatment, index) => (
                                                        <motion.tr
                                                            key={treatment.id}
                                                            className="border-b last:border-b-0"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.8 + index * 0.06 }}
                                                            whileHover={{ backgroundColor: `${palette.sage}12` }}
                                                        >
                                                            <TableCell className="text-muted-foreground">
                                                                {index + 1}
                                                            </TableCell>
                                                            <TableCell className="max-w-xs truncate font-medium">
                                                                {treatment.description}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                    style={{ borderColor: palette.leaf, color: palette.deep }}
                                                                >
                                                                    {getTreatmentTypeLabel(treatment.type)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="font-mono" style={{ color: palette.deep }}>
                                                                {treatment.dosage}
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">
                                                                {treatment.dosage_unit || '-'}
                                                            </TableCell>
                                                        </motion.tr>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Tidak ada informasi dosis yang tersedia.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Predictions Chart (Image method) */}
                {detection.method === 'image' && sortedPredictions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, type: 'spring', stiffness: 200, damping: 25 }}
                    >
                        <Card className="border" style={{ borderColor: `${palette.sand}` }}>
                            <CardHeader>
                                <CardTitle className="text-sm" style={{ color: palette.deep }}>Distribusi Prediksi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {sortedPredictions.map(([label, score], index) => {
                                        const percent = Math.round(score * 100 * 10) / 10;
                                        const isTop = score === maxPrediction;

                                        return (
                                            <motion.div
                                                key={label}
                                                initial={{ opacity: 0, x: -16 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 1.0 + index * 0.06 }}
                                            >
                                                <div className="mb-1 flex items-center justify-between text-sm">
                                                    <span
                                                        className={isTop ? 'font-semibold' : 'text-muted-foreground'}
                                                        style={isTop ? { color: palette.deep } : undefined}
                                                    >
                                                        {label}
                                                    </span>
                                                    <span
                                                        className={`font-mono text-xs ${isTop ? 'font-semibold' : 'text-muted-foreground'}`}
                                                        style={isTop ? { color: palette.deep } : undefined}
                                                    >
                                                        {percent}%
                                                    </span>
                                                </div>
                                                <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: `${palette.sand}88` }}>
                                                    <motion.div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            backgroundColor: isTop ? palette.teal : `${palette.leaf}55`,
                                                        }}
                                                        variants={barVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        custom={percent}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Selected Symptoms (Expert System method) */}
                {detection.method === 'expert_system' && matchedSymptoms && matchedSymptoms.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, type: 'spring', stiffness: 200, damping: 25 }}
                    >
                        <Card className="border" style={{ borderColor: `${palette.sand}` }}>
                            <CardHeader>
                                <CardTitle className="text-sm" style={{ color: palette.deep }}>Gejala yang Dipilih</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {matchedSymptoms.map((symptom, index) => (
                                        <motion.div
                                            key={symptom.id}
                                            className="flex items-start gap-2 rounded-lg border p-3"
                                            style={{ borderColor: `${palette.sage}66` }}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1.0 + index * 0.05 }}
                                            whileHover={{ backgroundColor: `${palette.sage}12` }}
                                        >
                                            <Badge
                                                className="shrink-0 font-mono text-xs text-white"
                                                style={{ backgroundColor: palette.leaf }}
                                            >
                                                {symptom.code}
                                            </Badge>
                                            <span className="text-sm">{symptom.name}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Notes */}
                {detection.notes && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 }}
                    >
                        <Card className="border" style={{ borderColor: `${palette.sand}` }}>
                            <CardHeader>
                                <CardTitle className="text-sm" style={{ color: palette.deep }}>Catatan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {detection.notes}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </>
    );
}

DetectionShow.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Riwayat Deteksi',
            href: '/detection/history',
        },
        {
            title: 'Detail Deteksi',
            href: '#',
        },
    ],
};
