import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Camera,
    CheckCircle2,
    Clock,
    CloudOff,
    ImageIcon,
    Leaf,
    MapPin,
    Save,
    ScanLine,
    ShieldCheck,
    Thermometer,
    Upload,
    Wifi,
    WifiOff,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import type { DiseaseData, TreatmentData } from '@/lib/expert-system';
import { formatCoordinates, gatherEnvironmentData, getGoogleMapsUrl  } from '@/lib/geo-weather';
import type {EnvironmentData} from '@/lib/geo-weather';
import { getTopPrediction, loadModel, predict  } from '@/lib/ml-model';
import type {Prediction} from '@/lib/ml-model';
import { dashboard } from '@/routes';


// ---------------------------------------------------------------------------
// Color palette constants
// ---------------------------------------------------------------------------

const PALETTE = {
    sand: '#DDD8C4',
    sage: '#A3C9A8',
    leaf: '#84B59F',
    teal: '#69A297',
    deep: '#50808E',
} as const;

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const staggerItem = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
};

const dropZoneVariants = {
    idle: {
        borderColor: 'rgba(80,128,142,0.25)',
        backgroundColor: 'rgba(80,128,142,0)',
    },
    hover: {
        borderColor: PALETTE.teal,
        backgroundColor: 'rgba(80,128,142,0.05)',
        transition: { duration: 0.2 },
    },
    dragging: {
        borderColor: PALETTE.deep,
        backgroundColor: 'rgba(80,128,142,0.1)',
        scale: 1.01,
        transition: { duration: 0.2 },
    },
};

const pulseRing = {
    initial: { scale: 1, opacity: 0.5 },
    animate: {
        scale: [1, 1.4, 1],
        opacity: [0.5, 0, 0.5],
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
    diseases: Array<DiseaseData & { treatments: TreatmentData[] }>;
}

type Step = 'upload' | 'preview' | 'analyzing' | 'results';

interface ScanResult {
    imageFile: File;
    imagePreviewUrl: string;
    predictions: Prediction[];
    topPrediction: Prediction;
    disease: (DiseaseData & { treatments: TreatmentData[] }) | null;
    scanTimestamp: string;
    scanDurationMs: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(iso: string): string {
    return new Date(iso).toLocaleString('id-ID', {
        dateStyle: 'long',
        timeStyle: 'medium',
    });
}

function confidenceTextClass(confidence: number): string {
    if (confidence >= 80) {
return 'text-green-600 dark:text-green-400';
}

    if (confidence >= 50) {
return 'text-yellow-600 dark:text-yellow-400';
}

    return 'text-red-600 dark:text-red-400';
}

// ---------------------------------------------------------------------------
// Animated prediction bar component
// ---------------------------------------------------------------------------

function PredictionBar({ prediction, index }: { prediction: Prediction; index: number }) {
    return (
        <motion.div
            className="flex items-center gap-2 text-xs"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
        >
            <span className="w-32 shrink-0 truncate text-muted-foreground">{prediction.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#DDD8C4]/40 dark:bg-[#DDD8C4]/10">
                <motion.div
                    className="h-full rounded-full"
                    style={{
                        background: `linear-gradient(90deg, ${PALETTE.teal}, ${PALETTE.deep})`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(prediction.confidence, 0.5)}%` }}
                    transition={{ delay: 0.3 + index * 0.06, duration: 0.7, ease: 'easeOut' }}
                />
            </div>
            <span className="w-12 text-right font-mono">{prediction.confidence.toFixed(1)}%</span>
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DetectionIndex({ diseases }: Props) {
    // Step state
    const [step, setStep] = useState<Step>('upload');

    // Environment
    const [envData, setEnvData] = useState<EnvironmentData | null>(null);
    const [envLoading, setEnvLoading] = useState(true);
    const [envError, setEnvError] = useState<string | null>(null);

    // Image
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Analysis
    const [modelError, setModelError] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);

    // Saving
    const [saving, setSaving] = useState(false);

    // Drag state
    const [isDragging, setIsDragging] = useState(false);

    // Hover state for drop zone
    const [isHovering, setIsHovering] = useState(false);

    // Connection status listener
    const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>(
        typeof navigator !== 'undefined' ? (navigator.onLine ? 'online' : 'offline') : 'online',
    );

    useEffect(() => {
        const handleOnline = () => setConnectionStatus('online');
        const handleOffline = () => setConnectionStatus('offline');
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Gather environment data on mount
    useEffect(() => {
        let cancelled = false;
        gatherEnvironmentData()
            .then((data) => {
                if (!cancelled) {
                    setEnvData(data);

                    if (data.error) {
setEnvError(data.error);
}
                }
            })
            .catch((err) => {
                if (!cancelled) {
setEnvError(err instanceof Error ? err.message : 'Gagal mengambil data lingkungan');
}
            })
            .finally(() => {
                if (!cancelled) {
setEnvLoading(false);
}
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) {
URL.revokeObjectURL(previewUrl);
}
        };
    }, [previewUrl]);

    // -----------------------------------------------------------------------
    // File handling
    // -----------------------------------------------------------------------

    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
return;
}

        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setStep('preview');
        setModelError(null);
        setScanResult(null);
    }, []);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];

            if (file) {
handleFileSelect(file);
}
        },
        [handleFileSelect],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];

            if (file) {
handleFileSelect(file);
}
        },
        [handleFileSelect],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const resetAll = useCallback(() => {
        setStep('upload');
        setSelectedFile(null);

        if (previewUrl) {
URL.revokeObjectURL(previewUrl);
}

        setPreviewUrl(null);
        setScanResult(null);
        setModelError(null);

        if (fileInputRef.current) {
fileInputRef.current.value = '';
}
    }, [previewUrl]);

    // -----------------------------------------------------------------------
    // ML Analysis
    // -----------------------------------------------------------------------

    const runAnalysis = useCallback(async () => {
        if (!selectedFile || !previewUrl) {
return;
}

        setStep('analyzing');
        setModelError(null);

        const startTime = performance.now();
        const scanTimestamp = new Date().toISOString();

        try {
            // Load model
            await loadModel();

            // Create image element for inference
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Gagal memuat gambar untuk analisis.'));
                img.src = previewUrl;
            });

            // Run prediction
            const predictions = await predict(img);
            const topPrediction = getTopPrediction(predictions);
            const scanDurationMs = Math.round(performance.now() - startTime);

            // Match disease from props
            const matchedDisease =
                diseases.find(
                    (d) => d.name.toLowerCase() === topPrediction.label.toLowerCase() || d.slug === topPrediction.label.toLowerCase().replace(/\s+/g, '-'),
                ) ?? null;

            const result: ScanResult = {
                imageFile: selectedFile,
                imagePreviewUrl: previewUrl,
                predictions,
                topPrediction,
                disease: matchedDisease,
                scanTimestamp,
                scanDurationMs,
            };

            setScanResult(result);
            setStep('results');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat analisis.';
            setModelError(message);
            setStep('preview');
        } finally {
            // step is already set to 'results' or 'preview' above
        }
    }, [selectedFile, previewUrl, diseases]);

    // -----------------------------------------------------------------------
    // Save result
    // -----------------------------------------------------------------------

    const handleSave = useCallback(() => {
        if (!scanResult || !envData) {
            return;
        }

        setSaving(true);

        const formData = new FormData();

        // Required field
        formData.append('method', 'image');

        // Image file
        formData.append('image', scanResult.imageFile);

        // Label & confidence (field names must match backend validation)
        formData.append('label', scanResult.topPrediction.label);
        formData.append('confidence', String(scanResult.topPrediction.confidence));

        // Timestamp & duration
        formData.append('scanned_at', scanResult.scanTimestamp);
        formData.append('scan_duration_ms', String(scanResult.scanDurationMs));

        // Connection status
        formData.append('connection_status', connectionStatus);

        // Optional fields - only append if value exists
        if (envData.weather?.temperature != null) {
            formData.append('temperature', String(envData.weather.temperature));
        }

        if (envData.position?.latitude != null) {
            formData.append('latitude', String(envData.position.latitude));
        }

        if (envData.position?.longitude != null) {
            formData.append('longitude', String(envData.position.longitude));
        }

        if (scanResult.disease?.id) {
            formData.append('disease_id', String(scanResult.disease.id));
        }

        // All predictions as JSON
        formData.append('predictions', JSON.stringify(scanResult.predictions));

        router.post('/detection', formData, {
            forceFormData: true,
            onFinish: () => setSaving(false),
        });
    }, [scanResult, envData, connectionStatus]);

    // -----------------------------------------------------------------------
    // Derived values for results display
    // -----------------------------------------------------------------------

    const treatments = scanResult?.disease?.treatments ?? [];
    const isHealthy = scanResult?.topPrediction.label === 'Healthy';

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
        <>
            <Head title="Deteksi Penyakit Padi" />

            <motion.div
                className="flex flex-col gap-6 p-4 md:p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                {/* Page header */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                    <h1 className="text-2xl font-bold tracking-tight">
                        Deteksi Penyakit Padi
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Unggah foto daun padi untuk mendeteksi penyakit menggunakan model Machine Learning di perangkat Anda.
                    </p>
                </motion.div>

                {/* Environment info badges */}
                <motion.div
                    className="flex flex-wrap items-center gap-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                >
                    <Badge
                        variant={connectionStatus === 'online' ? 'default' : 'destructive'}
                        className="gap-1.5"
                        style={connectionStatus === 'online' ? { backgroundColor: PALETTE.deep } : undefined}
                    >
                        {connectionStatus === 'online' ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
                        {connectionStatus === 'online' ? 'Online' : 'Offline'}
                    </Badge>

                    {envLoading ? (
                        <Badge variant="secondary" className="gap-1.5">
                            <Spinner className="size-3" />
                            Mengambil data lokasi...
                        </Badge>
                    ) : envData?.position ? (
                        <Badge variant="outline" className="gap-1.5" style={{ borderColor: PALETTE.teal, color: PALETTE.deep }}>
                            <MapPin className="size-3" />
                            {formatCoordinates(envData.position.latitude, envData.position.longitude)}
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="gap-1.5">
                            <MapPin className="size-3" />
                            Lokasi tidak tersedia
                        </Badge>
                    )}

                    {envData?.weather ? (
                        <Badge variant="outline" className="gap-1.5" style={{ borderColor: PALETTE.sage, color: PALETTE.deep }}>
                            <Thermometer className="size-3" />
                            {envData.weather.temperature}°C
                        </Badge>
                    ) : envLoading ? null : (
                        <Badge variant="secondary" className="gap-1.5">
                            <Thermometer className="size-3" />
                            Suhu tidak tersedia
                        </Badge>
                    )}
                </motion.div>

                {/* Environment error */}
                <AnimatePresence>
                    {envError && (
                        <motion.div {...fadeInUp} transition={{ duration: 0.3 }}>
                            <Alert variant="default">
                                <AlertCircle className="size-4" />
                                <AlertTitle>Info Lingkungan</AlertTitle>
                                <AlertDescription>{envError}</AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Model error */}
                <AnimatePresence>
                    {modelError && (
                        <motion.div {...fadeInUp} transition={{ duration: 0.3 }}>
                            <Alert variant="destructive">
                                <AlertCircle className="size-4" />
                                <AlertTitle>Gagal Analisis</AlertTitle>
                                <AlertDescription>
                                    {modelError}
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --------------------------------------------------------- */}
                {/* Step transitions with AnimatePresence */}
                {/* --------------------------------------------------------- */}
                <AnimatePresence mode="wait">
                    {/* ----------------------------------------------------- */}
                    {/* STEP: Upload */}
                    {/* ----------------------------------------------------- */}
                    {step === 'upload' && (
                        <motion.div
                            key="step-upload"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, transition: { duration: 0.25 } }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                            <Card className="overflow-hidden border-[#DDD8C4]/50 dark:border-[#50808E]/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Camera className="size-5" style={{ color: PALETTE.deep }} />
                                        Unggah Citra Daun Padi
                                    </CardTitle>
                                    <CardDescription>
                                        Pilih atau seret foto daun padi ke area di bawah. Format yang didukung: JPG, PNG, WebP.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <motion.div
                                        variants={dropZoneVariants}
                                        initial="idle"
                                        animate={isDragging ? 'dragging' : isHovering ? 'hover' : 'idle'}
                                        whileTap={{ scale: 0.99 }}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onMouseEnter={() => setIsHovering(true)}
                                        onMouseLeave={() => setIsHovering(false)}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-shadow hover:shadow-md"
                                        style={{ borderColor: PALETTE.teal + '40' }}
                                    >
                                        <motion.div
                                            animate={isDragging ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        >
                                            <div className="relative mb-4">
                                                <motion.div
                                                    className="absolute inset-0 rounded-full"
                                                    style={{ backgroundColor: PALETTE.teal + '20' }}
                                                    variants={pulseRing}
                                                    initial="initial"
                                                    animate={isDragging ? 'animate' : 'initial'}
                                                />
                                                <div
                                                    className="flex size-16 items-center justify-center rounded-full"
                                                    style={{ backgroundColor: PALETTE.sand + '60' }}
                                                >
                                                    <Upload className="size-7" style={{ color: PALETTE.deep }} />
                                                </div>
                                            </div>
                                        </motion.div>
                                        <p className="text-sm font-medium">
                                            Klik untuk memilih atau seret gambar ke sini
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            JPG, PNG, atau WebP (maks. 10MB)
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handleInputChange}
                                        />
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* ----------------------------------------------------- */}
                    {/* STEP: Preview */}
                    {/* ----------------------------------------------------- */}
                    {step === 'preview' && previewUrl && (
                        <motion.div
                            key="step-preview"
                            initial={{ opacity: 0, scale: 0.97, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: -16, transition: { duration: 0.25 } }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                        >
                            <Card className="overflow-hidden border-[#DDD8C4]/50 dark:border-[#50808E]/20">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="size-5" style={{ color: PALETTE.teal }} />
                                            Pratinjau Gambar
                                        </CardTitle>
                                        <Button variant="ghost" size="icon" onClick={resetAll}>
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                    <CardDescription>Pastikan gambar terlihat jelas sebelum memulai analisis.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <motion.div
                                        className="flex justify-center"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, delay: 0.1 }}
                                    >
                                        <img
                                            src={previewUrl}
                                            alt="Pratinjau daun padi"
                                            className="max-h-80 rounded-lg border object-contain shadow-sm"
                                            style={{ borderColor: PALETTE.sand }}
                                        />
                                    </motion.div>
                                    {selectedFile && (
                                        <motion.p
                                            className="mt-3 text-center text-xs text-muted-foreground"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                        </motion.p>
                                    )}
                                </CardContent>
                                <CardFooter className="justify-center gap-3">
                                    <Button variant="outline" onClick={resetAll}>
                                        Ganti Gambar
                                    </Button>
                                    <Button
                                        onClick={runAnalysis}
                                        style={{ backgroundColor: PALETTE.deep }}
                                        className="text-white hover:opacity-90"
                                    >
                                        <ScanLine className="size-4" />
                                        Analisis
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {/* ----------------------------------------------------- */}
                    {/* STEP: Analyzing */}
                    {/* ----------------------------------------------------- */}
                    {step === 'analyzing' && (
                        <motion.div
                            key="step-analyzing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.4 }}
                        >
                            <Card className="overflow-hidden border-[#DDD8C4]/50 dark:border-[#50808E]/20">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <motion.div
                                        className="relative mb-6"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <div
                                            className="size-16 rounded-full border-4 border-t-transparent"
                                            style={{ borderColor: PALETTE.sand, borderTopColor: 'transparent' }}
                                        />
                                        <div
                                            className="absolute inset-1 rounded-full border-4 border-b-transparent"
                                            style={{ borderColor: PALETTE.teal, borderBottomColor: 'transparent' }}
                                        />
                                    </motion.div>
                                    <motion.p
                                        className="text-lg font-medium"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        Menganalisis gambar...
                                    </motion.p>
                                    <motion.p
                                        className="mt-1 text-sm text-muted-foreground"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        Model ML sedang memproses citra daun padi Anda.
                                    </motion.p>
                                    {/* Animated progress bar */}
                                    <motion.div
                                        className="mt-6 h-1.5 w-48 overflow-hidden rounded-full"
                                        style={{ backgroundColor: PALETTE.sand + '40' }}
                                    >
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: `linear-gradient(90deg, ${PALETTE.sage}, ${PALETTE.deep})` }}
                                            initial={{ width: '0%' }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 4, ease: 'easeInOut' }}
                                        />
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* ----------------------------------------------------- */}
                    {/* STEP: Results */}
                    {/* ----------------------------------------------------- */}
                    {step === 'results' && scanResult && (
                        <motion.div
                            key="step-results"
                            className="flex flex-col gap-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Results header */}
                            <motion.div
                                className="flex items-center gap-2"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <CheckCircle2 className="size-5" style={{ color: PALETTE.sage }} />
                                <h2 className="text-lg font-semibold">Hasil Deteksi</h2>
                            </motion.div>

                            {/* 9 Variables Grid */}
                            <motion.div
                                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                            >
                                {/* VAR 1: Citra Daun */}
                                <motion.div variants={staggerItem} transition={{ duration: 0.4 }} className="md:row-span-2">
                                    <Card className="h-full overflow-hidden border-[#DDD8C4]/50 dark:border-[#50808E]/20">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-sm">
                                                <ImageIcon className="size-4" style={{ color: PALETTE.teal }} />
                                                Citra Daun
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <motion.img
                                                src={scanResult.imagePreviewUrl}
                                                alt="Citra daun padi"
                                                className="w-full rounded-lg border object-cover shadow-sm"
                                                style={{ borderColor: PALETTE.sand }}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.5, delay: 0.2 }}
                                            />
                                            {selectedFile && (
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    {selectedFile.name}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* VAR 2: Label Penyakit */}
                                <motion.div variants={staggerItem} transition={{ duration: 0.4 }}>
                                    <Card className="h-full overflow-hidden border-[#DDD8C4]/50 dark:border-[#50808E]/20">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-sm">
                                                <Leaf className="size-4" style={{ color: PALETTE.leaf }} />
                                                Label Penyakit
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <motion.p
                                                className="text-2xl font-bold"
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3, duration: 0.4 }}
                                            >
                                                {scanResult.topPrediction.label}
                                            </motion.p>
                                            {scanResult.disease?.latin_name && (
                                                <p className="mt-1 text-sm italic text-muted-foreground">
                                                    {scanResult.disease.latin_name}
                                                </p>
                                            )}
                                            {isHealthy ? (
                                                <Badge
                                                    className="mt-2 gap-1"
                                                    style={{ backgroundColor: PALETTE.sage, color: '#fff' }}
                                                >
                                                    <ShieldCheck className="size-3" />
                                                    Sehat
                                                </Badge>
                                            ) : (
                                                <Badge className="mt-2" variant="destructive">
                                                    Terdeteksi Penyakit
                                                </Badge>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* VAR 3: Tingkat Akurasi */}
                                <motion.div variants={staggerItem} transition={{ duration: 0.4 }}>
                                    <Card className="h-full overflow-hidden border-[#DDD8C4]/50 dark:border-[#50808E]/20">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-sm">
                                                <ScanLine className="size-4" style={{ color: PALETTE.deep }} />
                                                Tingkat Akurasi
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <motion.p
                                                className={`text-3xl font-bold ${confidenceTextClass(scanResult.topPrediction.confidence)}`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
                                            >
                                                {scanResult.topPrediction.confidence.toFixed(2)}%
                                            </motion.p>
                                            {/* Animated prediction bars */}
                                            <div className="mt-3 space-y-1.5">
                                                {scanResult.predictions.map((p, i) => (
                                                    <PredictionBar key={p.label} prediction={p} index={i} />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* VAR 4: Suhu */}
                                <motion.div variants={staggerItem} transition={{ duration: 0.4 }}>
                                    <Card className="h-full overflow-hidden border-[#DDD8C4]/50 dark:border-[#50808E]/20">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-sm">
                                                <Thermometer className="size-4" style={{ color: PALETTE.teal }} />
                                                Suhu
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {envData?.weather ? (
                                                <>
                                                    <motion.p
                                                        className="text-2xl font-bold"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.4 }}
                                                    >
                                                        {envData.weather.temperature}°C
                                                    </motion.p>
                                                    <p className="mt-1 text-sm capitalize text-muted-foreground">
                                                        {envData.weather.description} &middot; Kelembapan {envData.weather.humidity}%
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Data suhu tidak tersedia</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* VAR 5: Waktu Pemindaian */}
                                <motion.div variants={staggerItem} transition={{ duration: 0.4 }}>
                                    <Card className="h-full overflow-hidden border-[#DDD8C4]/50 dark:border-[#50808E]/20">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-sm">
                                                <Clock className="size-4" style={{ color: PALETTE.deep }} />
                                                Waktu Pemindaian
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm font-medium">{formatTimestamp(scanResult.scanTimestamp)}</p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Durasi: <span className="font-mono font-medium">{scanResult.scanDurationMs} ms</span>
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* VAR 6: Titik Koordinat */}
                                <motion.div variants={staggerItem} transition={{ duration: 0.4 }}>
                                    <Card className="h-full overflow-hidden border-[#DDD8C4]/50 dark:border-[#50808E]/20">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-sm">
                                                <MapPin className="size-4" style={{ color: PALETTE.teal }} />
                                                Titik Koordinat
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {envData?.position ? (
                                                <>
                                                    <p className="font-mono text-sm font-medium">
                                                        {formatCoordinates(envData.position.latitude, envData.position.longitude)}
                                                    </p>
                                                    <a
                                                        href={getGoogleMapsUrl(envData.position.latitude, envData.position.longitude)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 inline-block text-xs hover:underline"
                                                        style={{ color: PALETTE.deep }}
                                                    >
                                                        Lihat di Google Maps
                                                    </a>
                                                </>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Lokasi tidak tersedia</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* VAR 7: Status Koneksi */}
                                <motion.div variants={staggerItem} transition={{ duration: 0.4 }}>
                                    <Card className="h-full overflow-hidden border-[#DDD8C4]/50 dark:border-[#50808E]/20">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-sm">
                                                {connectionStatus === 'online' ? (
                                                    <Wifi className="size-4" style={{ color: PALETTE.sage }} />
                                                ) : (
                                                    <CloudOff className="size-4" />
                                                )}
                                                Status Koneksi
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2">
                                                <motion.span
                                                    className="inline-block size-2.5 rounded-full"
                                                    style={{
                                                        backgroundColor: connectionStatus === 'online' ? PALETTE.sage : '#ef4444',
                                                    }}
                                                    animate={connectionStatus === 'online' ? {
                                                        boxShadow: [
                                                            `0 0 0 0 ${PALETTE.sage}40`,
                                                            `0 0 0 6px ${PALETTE.sage}00`,
                                                        ],
                                                    } : {}}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                />
                                                <p className="text-sm font-medium">
                                                    {connectionStatus === 'online' ? 'Online' : 'Offline'}
                                                </p>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {connectionStatus === 'online'
                                                    ? 'Perangkat terhubung ke internet'
                                                    : 'Perangkat tidak terhubung ke internet'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* VAR 8: Rekomendasi Tindakan */}
                                <motion.div variants={staggerItem} transition={{ duration: 0.4 }} className="md:col-span-2 lg:col-span-2">
                                    <Card className="h-full overflow-hidden border-[#DDD8C4]/50 dark:border-[#50808E]/20">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-sm">
                                                <ShieldCheck className="size-4" style={{ color: PALETTE.leaf }} />
                                                Rekomendasi Tindakan
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {isHealthy ? (
                                                <p className="text-sm">
                                                    Daun padi dalam kondisi sehat. Lanjutkan perawatan rutin dan pantau secara berkala.
                                                </p>
                                            ) : treatments.length > 0 ? (
                                                <ul className="list-inside list-disc space-y-1.5 text-sm">
                                                    {[...treatments]
                                                        .sort((a, b) => a.priority - b.priority)
                                                        .map((t) => (
                                                            <motion.li
                                                                key={t.id}
                                                                initial={{ opacity: 0, x: -8 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                <Badge
                                                                    variant="outline"
                                                                    className="mr-1.5 text-[10px]"
                                                                    style={{ borderColor: PALETTE.teal, color: PALETTE.deep }}
                                                                >
                                                                    {t.type}
                                                                </Badge>
                                                                {t.description}
                                                            </motion.li>
                                                        ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    Tidak ada rekomendasi tindakan tersedia untuk penyakit ini.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* VAR 9: Dosis */}
                                <motion.div variants={staggerItem} transition={{ duration: 0.4 }}>
                                    <Card className="h-full overflow-hidden border-[#DDD8C4]/50 dark:border-[#50808E]/20">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-sm">
                                                <AlertCircle className="size-4" style={{ color: PALETTE.teal }} />
                                                Dosis
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {isHealthy ? (
                                                <p className="text-sm text-muted-foreground">Tidak diperlukan pengobatan.</p>
                                            ) : treatments.filter((t) => t.dosage).length > 0 ? (
                                                <ul className="list-inside list-disc space-y-1 text-sm">
                                                    {treatments
                                                        .filter((t) => t.dosage)
                                                        .map((t) => (
                                                            <li key={t.id}>
                                                                {t.dosage}
                                                                {t.dosage_unit ? ` ${t.dosage_unit}` : ''}
                                                            </li>
                                                        ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Informasi dosis tidak tersedia.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </motion.div>

                            {/* Action buttons */}
                            <motion.div
                                className="flex flex-wrap items-center gap-3"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.4 }}
                            >
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || !envData}
                                    style={{ backgroundColor: PALETTE.deep }}
                                    className="text-white hover:opacity-90 disabled:opacity-50"
                                    title={!envData ? 'Menunggu data lingkungan...' : undefined}
                                >
                                    {saving ? <Spinner className="size-4" /> : <Save className="size-4" />}
                                    {saving ? 'Menyimpan...' : !envData ? 'Menunggu data...' : 'Simpan Hasil'}
                                </Button>
                                <Button variant="outline" onClick={resetAll}>
                                    <ScanLine className="size-4" />
                                    Deteksi Baru
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

DetectionIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Deteksi Penyakit',
            href: '/detection',
        },
    ],
};
