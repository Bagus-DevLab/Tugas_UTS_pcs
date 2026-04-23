import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import type { DiseaseData, TreatmentData } from '@/lib/expert-system';
import { formatCoordinates, gatherEnvironmentData, getGoogleMapsUrl, type EnvironmentData } from '@/lib/geo-weather';
import { CLASS_LABELS, getTopPrediction, loadModel, predict, type Prediction } from '@/lib/ml-model';
import { dashboard } from '@/routes';

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

function getTreatmentText(treatments: TreatmentData[]): string {
    if (!treatments.length) return 'Tidak ada rekomendasi tersedia.';
    const sorted = [...treatments].sort((a, b) => a.priority - b.priority);
    return sorted.map((t) => `${t.description}`).join('; ');
}

function getDosageText(treatments: TreatmentData[]): string {
    const withDosage = treatments.filter((t) => t.dosage);
    if (!withDosage.length) return '-';
    return withDosage.map((t) => `${t.dosage}${t.dosage_unit ? ' ' + t.dosage_unit : ''}`).join('; ');
}

function confidenceColor(confidence: number): string {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
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
    const [analyzing, setAnalyzing] = useState(false);
    const [modelError, setModelError] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);

    // Saving
    const [saving, setSaving] = useState(false);

    // Drag state
    const [isDragging, setIsDragging] = useState(false);

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
        setEnvLoading(true);
        gatherEnvironmentData()
            .then((data) => {
                if (!cancelled) {
                    setEnvData(data);
                    if (data.error) setEnvError(data.error);
                }
            })
            .catch((err) => {
                if (!cancelled) setEnvError(err instanceof Error ? err.message : 'Gagal mengambil data lingkungan');
            })
            .finally(() => {
                if (!cancelled) setEnvLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // -----------------------------------------------------------------------
    // File handling
    // -----------------------------------------------------------------------

    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) return;
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
            if (file) handleFileSelect(file);
        },
        [handleFileSelect],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileSelect(file);
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
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setScanResult(null);
        setModelError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [previewUrl]);

    // -----------------------------------------------------------------------
    // ML Analysis
    // -----------------------------------------------------------------------

    const runAnalysis = useCallback(async () => {
        if (!selectedFile || !previewUrl) return;

        setStep('analyzing');
        setAnalyzing(true);
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
            setAnalyzing(false);
        }
    }, [selectedFile, previewUrl, diseases]);

    // -----------------------------------------------------------------------
    // Save result
    // -----------------------------------------------------------------------

    const handleSave = useCallback(() => {
        if (!scanResult || !envData) return;

        setSaving(true);

        const formData = new FormData();
        formData.append('image', scanResult.imageFile);
        formData.append('disease_label', scanResult.topPrediction.label);
        formData.append('confidence', String(scanResult.topPrediction.confidence));
        formData.append('temperature', String(envData.weather?.temperature ?? ''));
        formData.append('scan_timestamp', scanResult.scanTimestamp);
        formData.append('scan_duration_ms', String(scanResult.scanDurationMs));
        formData.append('latitude', String(envData.position?.latitude ?? ''));
        formData.append('longitude', String(envData.position?.longitude ?? ''));
        formData.append('connection_status', connectionStatus);
        formData.append('disease_id', String(scanResult.disease?.id ?? ''));

        // Include all predictions as JSON
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

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Page header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Deteksi Penyakit Padi</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Unggah foto daun padi untuk mendeteksi penyakit menggunakan model Machine Learning di perangkat Anda.
                    </p>
                </div>

                {/* Environment info badges */}
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={connectionStatus === 'online' ? 'default' : 'destructive'} className="gap-1.5">
                        {connectionStatus === 'online' ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
                        {connectionStatus === 'online' ? 'Online' : 'Offline'}
                    </Badge>

                    {envLoading ? (
                        <Badge variant="secondary" className="gap-1.5">
                            <Spinner className="size-3" />
                            Mengambil data lokasi...
                        </Badge>
                    ) : envData?.position ? (
                        <Badge variant="outline" className="gap-1.5">
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
                        <Badge variant="outline" className="gap-1.5">
                            <Thermometer className="size-3" />
                            {envData.weather.temperature}°C
                        </Badge>
                    ) : envLoading ? null : (
                        <Badge variant="secondary" className="gap-1.5">
                            <Thermometer className="size-3" />
                            Suhu tidak tersedia
                        </Badge>
                    )}
                </div>

                {/* Environment error */}
                {envError && (
                    <Alert variant="default">
                        <AlertCircle className="size-4" />
                        <AlertTitle>Info Lingkungan</AlertTitle>
                        <AlertDescription>{envError}</AlertDescription>
                    </Alert>
                )}

                {/* Model error */}
                {modelError && (
                    <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertTitle>Gagal Analisis</AlertTitle>
                        <AlertDescription>
                            {modelError.includes('model')
                                ? 'Model ML belum tersedia. Silakan train model terlebih dahulu.'
                                : modelError}
                        </AlertDescription>
                    </Alert>
                )}

                {/* --------------------------------------------------------- */}
                {/* STEP: Upload */}
                {/* --------------------------------------------------------- */}
                {step === 'upload' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="size-5" />
                                Unggah Citra Daun Padi
                            </CardTitle>
                            <CardDescription>
                                Pilih atau seret foto daun padi ke area di bawah. Format yang didukung: JPG, PNG, WebP.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                                    isDragging
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                                }`}
                            >
                                <Upload className="text-muted-foreground mb-4 size-10" />
                                <p className="text-sm font-medium">Klik untuk memilih atau seret gambar ke sini</p>
                                <p className="text-muted-foreground mt-1 text-xs">JPG, PNG, atau WebP (maks. 10MB)</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleInputChange}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* --------------------------------------------------------- */}
                {/* STEP: Preview */}
                {/* --------------------------------------------------------- */}
                {step === 'preview' && previewUrl && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="size-5" />
                                    Pratinjau Gambar
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={resetAll}>
                                    <X className="size-4" />
                                </Button>
                            </div>
                            <CardDescription>Pastikan gambar terlihat jelas sebelum memulai analisis.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center">
                                <img
                                    src={previewUrl}
                                    alt="Pratinjau daun padi"
                                    className="max-h-80 rounded-lg border object-contain shadow-sm"
                                />
                            </div>
                            {selectedFile && (
                                <p className="text-muted-foreground mt-3 text-center text-xs">
                                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="justify-center gap-3">
                            <Button variant="outline" onClick={resetAll}>
                                Ganti Gambar
                            </Button>
                            <Button onClick={runAnalysis}>
                                <ScanLine className="size-4" />
                                Analisis
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* --------------------------------------------------------- */}
                {/* STEP: Analyzing */}
                {/* --------------------------------------------------------- */}
                {step === 'analyzing' && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Spinner className="mb-4 size-8" />
                            <p className="text-lg font-medium">Menganalisis gambar...</p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Model ML sedang memproses citra daun padi Anda.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* --------------------------------------------------------- */}
                {/* STEP: Results */}
                {/* --------------------------------------------------------- */}
                {step === 'results' && scanResult && (
                    <div className="flex flex-col gap-6">
                        {/* Results header */}
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-5 text-green-600" />
                            <h2 className="text-lg font-semibold">Hasil Deteksi</h2>
                        </div>

                        {/* 9 Variables Grid */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* VAR 1: Citra Daun */}
                            <Card className="md:row-span-2">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <ImageIcon className="size-4" />
                                        Citra Daun
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <img
                                        src={scanResult.imagePreviewUrl}
                                        alt="Citra daun padi"
                                        className="w-full rounded-lg border object-cover shadow-sm"
                                    />
                                    {selectedFile && (
                                        <p className="text-muted-foreground mt-2 text-xs">
                                            {selectedFile.name}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* VAR 2: Label Penyakit */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Leaf className="size-4" />
                                        Label Penyakit
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">
                                        {scanResult.topPrediction.label}
                                    </p>
                                    {scanResult.disease?.latin_name && (
                                        <p className="text-muted-foreground mt-1 text-sm italic">
                                            {scanResult.disease.latin_name}
                                        </p>
                                    )}
                                    {isHealthy ? (
                                        <Badge className="mt-2 gap-1" variant="default">
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

                            {/* VAR 3: Tingkat Akurasi */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <ScanLine className="size-4" />
                                        Tingkat Akurasi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className={`text-3xl font-bold ${confidenceColor(scanResult.topPrediction.confidence)}`}>
                                        {scanResult.topPrediction.confidence.toFixed(2)}%
                                    </p>
                                    {/* Mini bar chart of all predictions */}
                                    <div className="mt-3 space-y-1.5">
                                        {scanResult.predictions.map((p) => (
                                            <div key={p.label} className="flex items-center gap-2 text-xs">
                                                <span className="text-muted-foreground w-32 shrink-0 truncate">{p.label}</span>
                                                <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                                                    <div
                                                        className="bg-primary h-full rounded-full transition-all"
                                                        style={{ width: `${Math.max(p.confidence, 0.5)}%` }}
                                                    />
                                                </div>
                                                <span className="w-12 text-right font-mono">{p.confidence.toFixed(1)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* VAR 4: Suhu */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Thermometer className="size-4" />
                                        Suhu
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {envData?.weather ? (
                                        <>
                                            <p className="text-2xl font-bold">{envData.weather.temperature}°C</p>
                                            <p className="text-muted-foreground mt-1 text-sm capitalize">
                                                {envData.weather.description} &middot; Kelembapan {envData.weather.humidity}%
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">Data suhu tidak tersedia</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* VAR 5: Waktu Pemindaian */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Clock className="size-4" />
                                        Waktu Pemindaian
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm font-medium">{formatTimestamp(scanResult.scanTimestamp)}</p>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        Durasi: <span className="font-mono font-medium">{scanResult.scanDurationMs} ms</span>
                                    </p>
                                </CardContent>
                            </Card>

                            {/* VAR 6: Titik Koordinat */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <MapPin className="size-4" />
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
                                                className="text-primary mt-1 inline-block text-xs hover:underline"
                                            >
                                                Lihat di Google Maps
                                            </a>
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">Lokasi tidak tersedia</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* VAR 7: Status Koneksi */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        {connectionStatus === 'online' ? (
                                            <Wifi className="size-4" />
                                        ) : (
                                            <CloudOff className="size-4" />
                                        )}
                                        Status Koneksi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`inline-block size-2.5 rounded-full ${
                                                connectionStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                        />
                                        <p className="text-sm font-medium">
                                            {connectionStatus === 'online' ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        {connectionStatus === 'online'
                                            ? 'Perangkat terhubung ke internet'
                                            : 'Perangkat tidak terhubung ke internet'}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* VAR 8: Rekomendasi Tindakan */}
                            <Card className="md:col-span-2 lg:col-span-2">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <ShieldCheck className="size-4" />
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
                                                    <li key={t.id}>
                                                        <Badge variant="outline" className="mr-1.5 text-[10px]">
                                                            {t.type}
                                                        </Badge>
                                                        {t.description}
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">
                                            Tidak ada rekomendasi tindakan tersedia untuk penyakit ini.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* VAR 9: Dosis */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <AlertCircle className="size-4" />
                                        Dosis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isHealthy ? (
                                        <p className="text-muted-foreground text-sm">Tidak diperlukan pengobatan.</p>
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
                                        <p className="text-muted-foreground text-sm">Informasi dosis tidak tersedia.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? <Spinner className="size-4" /> : <Save className="size-4" />}
                                {saving ? 'Menyimpan...' : 'Simpan Hasil'}
                            </Button>
                            <Button variant="outline" onClick={resetAll}>
                                <ScanLine className="size-4" />
                                Deteksi Baru
                            </Button>
                        </div>
                    </div>
                )}
            </div>
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
