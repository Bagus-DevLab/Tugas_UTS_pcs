import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';


import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import {
    diagnose,
    filterByThreshold,
    getTopDiagnosis
    
    
    
    
} from '@/lib/expert-system';
import type {DiagnosisResult, DiseaseData, SymptomData, TreatmentData} from '@/lib/expert-system';
import {
    formatCoordinates,
    gatherEnvironmentData
    
} from '@/lib/geo-weather';
import type {EnvironmentData} from '@/lib/geo-weather';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DiseaseWithRelations = DiseaseData & {
    symptoms: Array<SymptomData & { pivot: { weight: number } }>;
    treatments: TreatmentData[];
};

interface Props {
    symptoms: SymptomData[];
    diseases: DiseaseWithRelations[];
}

// ---------------------------------------------------------------------------
// Color Palette
// ---------------------------------------------------------------------------

const palette = {
    primary: '#059669',
    secondary: '#10b981',
    muted: '#64748b',
    light: '#94a3b8',
    lightest: '#cbd5e1',
} as const;

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
        },
    },
};

const symptomItemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
};

const resultsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 },
    },
};

const resultCardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 260, damping: 22 },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.2 },
    },
};

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TREATMENT_TYPE_LABELS: Record<TreatmentData['type'], string> = {
    prevention: 'Pencegahan',
    chemical: 'Kimiawi',
    biological: 'Biologis',
    cultural: 'Kultur Teknis',
};

const TREATMENT_TYPE_VARIANTS: Record<
    TreatmentData['type'],
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    prevention: 'secondary',
    chemical: 'destructive',
    biological: 'default',
    cultural: 'outline',
};

function cfLabel(cf: number): string {
    if (cf >= 80) {
return 'Sangat Yakin';
}

    if (cf >= 60) {
return 'Yakin';
}

    if (cf >= 40) {
return 'Cukup Yakin';
}

    if (cf >= 20) {
return 'Kurang Yakin';
}

    return 'Tidak Yakin';
}

function cfColorHex(cf: number): string {
    if (cf >= 80) {
return palette.primary;
}

    if (cf >= 60) {
return palette.secondary;
}

    if (cf >= 40) {
return palette.muted;
}

    if (cf >= 20) {
return palette.light;
}

    return palette.lightest;
}

// ---------------------------------------------------------------------------
// Animated CF Bar
// ---------------------------------------------------------------------------

function AnimatedCFBar({
    cf,
    height = 'h-3',
}: {
    cf: number;
    height?: string;
}) {
    return (
        <div
            className={`${height} w-full overflow-hidden rounded-full`}
            style={{ backgroundColor: `${palette.lightest}40` }}
        >
            <motion.div
                className={`${height} rounded-full`}
                style={{ backgroundColor: cfColorHex(cf) }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(cf, 100)}%` }}
                transition={{
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: 0.2,
                }}
            />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ExpertSystem({ symptoms, diseases }: Props) {
    // -- State ---------------------------------------------------------------
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [results, setResults] = useState<DiagnosisResult[] | null>(null);
    const [envData, setEnvData] = useState<EnvironmentData | null>(null);
    const [envLoading, setEnvLoading] = useState(true);
    const [diagnosing, setDiagnosing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [serverValidated, setServerValidated] = useState(false);

    const resultsRef = useRef<HTMLDivElement>(null);

    // -- Environment data (auto-fetch on mount) ------------------------------
    useEffect(() => {
        let cancelled = false;

        gatherEnvironmentData()
            .then((data) => {
                if (!cancelled) {
setEnvData(data);
}
            })
            .catch(() => {
                if (!cancelled) {
setEnvData({
                        position: null,
                        weather: null,
                        connectionStatus: 'offline',
                        error: 'Gagal mengambil data lingkungan.',
                    });
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

    // -- Symptom toggle ------------------------------------------------------
    const toggleSymptom = useCallback((id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
        );
    }, []);

    // -- Derived -------------------------------------------------------------
    const topResult = useMemo(
        () => (results ? getTopDiagnosis(results) : null),
        [results],
    );

    const filteredResults = useMemo(
        () => (results ? filterByThreshold(results, 10) : []),
        [results],
    );

    const topDisease = useMemo(() => {
        if (!topResult) {
return null;
}

        return diseases.find((d) => d.id === topResult.disease.id) ?? null;
    }, [topResult, diseases]);

    // -- Diagnose ------------------------------------------------------------
    const handleDiagnose = useCallback(async () => {
        if (selectedIds.length === 0) {
return;
}

        setDiagnosing(true);
        setResults(null);
        setServerValidated(false);

        // 1. Client-side diagnosis
        const clientResults = diagnose(selectedIds, diseases);
        setResults(clientResults);

        // 2. Server-side validation (fire-and-forget style, update on response)
        try {
            const response = await fetch('/expert-system/diagnose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie
                            .split('; ')
                            .find((c) => c.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1] ?? '',
                    ),
                },
                body: JSON.stringify({
                    symptom_ids: selectedIds,
                    environment: envData
                        ? {
                              latitude: envData.position?.latitude ?? null,
                              longitude: envData.position?.longitude ?? null,
                              temperature: envData.weather?.temperature ?? null,
                              humidity: envData.weather?.humidity ?? null,
                              connection_status: envData.connectionStatus,
                          }
                        : null,
                }),
            });

            if (response.ok) {
                setServerValidated(true);
            }
        } catch {
            // Server validation is optional; client-side results are still valid
        }

        setDiagnosing(false);

        // Scroll to results
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }, 100);
    }, [selectedIds, diseases, envData]);

    // -- Save ----------------------------------------------------------------
    const handleSave = useCallback(() => {
        if (!results || results.length === 0 || !topResult) {
return;
}

        setSaving(true);

        router.post(
            '/expert-system',
            {
                symptom_ids: selectedIds,
                results: filteredResults.map((r) => ({
                    disease_id: r.disease.id,
                    certainty_factor: r.certaintyFactor,
                    matching_symptoms: r.matchingSymptoms,
                    total_symptoms: r.totalSymptoms,
                })),
                top_disease_id: topResult.disease.id,
                top_certainty_factor: topResult.certaintyFactor,
                environment: envData
                    ? {
                          latitude: envData.position?.latitude ?? null,
                          longitude: envData.position?.longitude ?? null,
                          temperature: envData.weather?.temperature ?? null,
                          humidity: envData.weather?.humidity ?? null,
                          weather_description:
                              envData.weather?.description ?? null,
                          connection_status: envData.connectionStatus,
                      }
                    : null,
            },
            {
                onFinish: () => setSaving(false),
            },
        );
    }, [results, topResult, selectedIds, filteredResults, envData]);

    // -- Render --------------------------------------------------------------
    return (
        <>
            <Head title="Sistem Pakar - Diagnosa Penyakit Padi" />

            <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-6">
                {/* --------------------------------------------------------- */}
                {/* Header                                                    */}
                {/* --------------------------------------------------------- */}
                <motion.div
                    className="space-y-1"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                    <h1
                        className="text-xl font-semibold tracking-tight"
                        style={{ color: palette.primary }}
                    >
                        Sistem Pakar Diagnosa Penyakit Padi
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pilih gejala yang terlihat pada tanaman padi Anda, lalu
                        tekan tombol &ldquo;Diagnosa&rdquo; untuk mendapatkan
                        hasil analisis.
                    </p>
                </motion.div>

                {/* --------------------------------------------------------- */}
                {/* VAR 4, 6, 7 — Environment Info                           */}
                {/* --------------------------------------------------------- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card
                        className="overflow-hidden border-t-4"
                        style={{ borderTopColor: palette.secondary }}
                    >
                        <CardHeader>
                            <CardTitle
                                className="text-base"
                                style={{ color: palette.primary }}
                            >
                                Data Lingkungan
                            </CardTitle>
                            <CardDescription>
                                Dikumpulkan otomatis dari perangkat Anda
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {envLoading ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Spinner className="size-4" />
                                    <span>Mengambil data lingkungan...</span>
                                </div>
                            ) : envData ? (
                                <div className="grid gap-4 sm:grid-cols-3">
                                    {/* Koordinat */}
                                    <motion.div
                                        className="space-y-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Titik Koordinat
                                        </p>
                                        <p className="text-sm font-medium">
                                            {envData.position
                                                ? formatCoordinates(
                                                      envData.position.latitude,
                                                      envData.position
                                                          .longitude,
                                                  )
                                                : 'Tidak tersedia'}
                                        </p>
                                    </motion.div>

                                    {/* Suhu */}
                                    <motion.div
                                        className="space-y-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Suhu &amp; Cuaca
                                        </p>
                                        <p className="text-sm font-medium">
                                            {envData.weather
                                                ? `${envData.weather.temperature}°C — ${envData.weather.description}`
                                                : 'Tidak tersedia'}
                                        </p>
                                        {envData.weather && (
                                            <p className="text-xs text-muted-foreground">
                                                Kelembapan:{' '}
                                                {envData.weather.humidity}%
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Koneksi */}
                                    <motion.div
                                        className="space-y-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Status Koneksi
                                        </p>
                                        <Badge
                                            variant={
                                                envData.connectionStatus ===
                                                'online'
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                            style={
                                                envData.connectionStatus ===
                                                'online'
                                                    ? {
                                                          backgroundColor:
                                                              palette.secondary,
                                                          color: '#fff',
                                                      }
                                                    : undefined
                                            }
                                        >
                                            {envData.connectionStatus ===
                                            'online'
                                                ? 'Online'
                                                : 'Offline'}
                                        </Badge>
                                    </motion.div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Data lingkungan tidak tersedia.
                                </p>
                            )}

                            {envData?.error && (
                                <p className="mt-3 text-xs text-orange-600">
                                    {envData.error}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* --------------------------------------------------------- */}
                {/* Symptom Selection                                         */}
                {/* --------------------------------------------------------- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card
                        className="overflow-hidden border-t-4"
                        style={{ borderTopColor: palette.muted }}
                    >
                        <CardHeader>
                            <CardTitle
                                className="text-base"
                                style={{ color: palette.primary }}
                            >
                                Pilih Gejala
                            </CardTitle>
                            <CardDescription>
                                Centang gejala yang terlihat pada tanaman padi
                                Anda (
                                <span
                                    className="font-semibold"
                                    style={{ color: palette.secondary }}
                                >
                                    {selectedIds.length}
                                </span>{' '}
                                dipilih)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <motion.div
                                className="grid gap-3 sm:grid-cols-2"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {symptoms.map((symptom) => {
                                    const checked = selectedIds.includes(
                                        symptom.id,
                                    );

                                    return (
                                        <motion.label
                                            key={symptom.id}
                                            variants={symptomItemVariants}
                                            whileHover={{ scale: 1.015 }}
                                            whileTap={{ scale: 0.985 }}
                                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                                                checked
                                                    ? 'border-transparent'
                                                    : 'border-transparent hover:bg-muted/70'
                                            }`}
                                            style={
                                                checked
                                                    ? {
                                                          borderColor: `${palette.light}80`,
                                                          backgroundColor: `${palette.light}15`,
                                                      }
                                                    : {
                                                          backgroundColor: `${palette.lightest}20`,
                                                      }
                                            }
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={() =>
                                                    toggleSymptom(symptom.id)
                                                }
                                                className="mt-0.5"
                                            />
                                            <div className="flex-1 space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono text-[10px]"
                                                        style={{
                                                            borderColor:
                                                                palette.secondary,
                                                            color: palette.primary,
                                                        }}
                                                    >
                                                        {symptom.code}
                                                    </Badge>
                                                    <span className="text-sm font-medium leading-tight">
                                                        {symptom.name}
                                                    </span>
                                                </div>
                                                {symptom.description && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {symptom.description}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.label>
                                    );
                                })}
                            </motion.div>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-muted-foreground">
                                {selectedIds.length === 0
                                    ? 'Pilih minimal 1 gejala untuk memulai diagnosa.'
                                    : `${selectedIds.length} gejala dipilih.`}
                            </p>
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <Button
                                    onClick={handleDiagnose}
                                    disabled={
                                        selectedIds.length === 0 || diagnosing
                                    }
                                    size="lg"
                                    style={{
                                        backgroundColor:
                                            selectedIds.length === 0 ||
                                            diagnosing
                                                ? undefined
                                                : palette.primary,
                                    }}
                                >
                                    {diagnosing && (
                                        <Spinner className="size-4" />
                                    )}
                                    Diagnosa
                                </Button>
                            </motion.div>
                        </CardFooter>
                    </Card>
                </motion.div>

                {/* --------------------------------------------------------- */}
                {/* Results                                                   */}
                {/* --------------------------------------------------------- */}
                <AnimatePresence mode="wait">
                    {results !== null && (
                        <motion.div
                            ref={resultsRef}
                            className="flex flex-col gap-6"
                            variants={resultsContainerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {filteredResults.length === 0 ? (
                                <motion.div variants={resultCardVariants}>
                                    <Alert>
                                        <AlertTitle>
                                            Tidak Ditemukan Penyakit
                                        </AlertTitle>
                                        <AlertDescription>
                                            Gejala yang dipilih tidak cocok
                                            dengan penyakit manapun dalam basis
                                            pengetahuan. Coba pilih gejala lain
                                            atau konsultasikan dengan ahli
                                            pertanian.
                                        </AlertDescription>
                                    </Alert>
                                </motion.div>
                            ) : (
                                <>
                                    {/* -- Top Result ----------------------------- */}
                                    {topResult && topDisease && (
                                        <motion.div
                                            variants={resultCardVariants}
                                        >
                                            <Card
                                                className="overflow-hidden border-l-4"
                                                style={{
                                                    borderLeftColor:
                                                        palette.primary,
                                                }}
                                            >
                                                <CardHeader>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <CardTitle
                                                            className="text-lg"
                                                            style={{
                                                                color: palette.primary,
                                                            }}
                                                        >
                                                            Hasil Diagnosa Utama
                                                        </CardTitle>
                                                        {serverValidated && (
                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    scale: 0.5,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    scale: 1,
                                                                }}
                                                                transition={{
                                                                    type: 'spring',
                                                                    stiffness: 400,
                                                                    damping: 15,
                                                                }}
                                                            >
                                                                <Badge
                                                                    variant="secondary"
                                                                    style={{
                                                                        backgroundColor: `${palette.light}30`,
                                                                        color: palette.primary,
                                                                    }}
                                                                >
                                                                    Tervalidasi
                                                                    Server
                                                                </Badge>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                    <CardDescription>
                                                        Penyakit dengan tingkat
                                                        kepastian tertinggi
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-5">
                                                    {/* Disease name + CF */}
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap items-baseline gap-2">
                                                            <h3
                                                                className="text-xl font-bold"
                                                                style={{
                                                                    color: palette.primary,
                                                                }}
                                                            >
                                                                {
                                                                    topResult
                                                                        .disease
                                                                        .name
                                                                }
                                                            </h3>
                                                            {topResult.disease
                                                                .latin_name && (
                                                                <span className="text-sm italic text-muted-foreground">
                                                                    (
                                                                    {
                                                                        topResult
                                                                            .disease
                                                                            .latin_name
                                                                    }
                                                                    )
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* CF bar */}
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span
                                                                    className="font-medium"
                                                                    style={{
                                                                        color: palette.secondary,
                                                                    }}
                                                                >
                                                                    Certainty
                                                                    Factor
                                                                </span>
                                                                <span className="font-semibold">
                                                                    {topResult.certaintyFactor.toFixed(
                                                                        2,
                                                                    )}
                                                                    % &mdash;{' '}
                                                                    {cfLabel(
                                                                        topResult.certaintyFactor,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <AnimatedCFBar
                                                                cf={
                                                                    topResult.certaintyFactor
                                                                }
                                                            />
                                                        </div>

                                                        <p className="text-sm text-muted-foreground">
                                                            Gejala cocok:{' '}
                                                            {
                                                                topResult.matchingSymptoms
                                                            }{' '}
                                                            dari{' '}
                                                            {
                                                                topResult.totalSymptoms
                                                            }{' '}
                                                            gejala
                                                        </p>
                                                    </div>

                                                    {/* Description */}
                                                    <motion.div
                                                        className="space-y-1"
                                                        variants={fadeInUp}
                                                    >
                                                        <h4
                                                            className="text-sm font-semibold"
                                                            style={{
                                                                color: palette.secondary,
                                                            }}
                                                        >
                                                            Deskripsi
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {
                                                                topResult
                                                                    .disease
                                                                    .description
                                                            }
                                                        </p>
                                                    </motion.div>

                                                    {/* Cause */}
                                                    <motion.div
                                                        className="space-y-1"
                                                        variants={fadeInUp}
                                                    >
                                                        <h4
                                                            className="text-sm font-semibold"
                                                            style={{
                                                                color: palette.secondary,
                                                            }}
                                                        >
                                                            Penyebab
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {
                                                                topResult
                                                                    .disease
                                                                    .cause
                                                            }
                                                        </p>
                                                    </motion.div>

                                                    {/* Matched symptoms */}
                                                    <motion.div
                                                        className="space-y-2"
                                                        variants={fadeInUp}
                                                    >
                                                        <h4
                                                            className="text-sm font-semibold"
                                                            style={{
                                                                color: palette.secondary,
                                                            }}
                                                        >
                                                            Gejala yang Cocok
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {topResult.matchedSymptomDetails.map(
                                                                (
                                                                    {
                                                                        symptom,
                                                                        weight,
                                                                    },
                                                                    i,
                                                                ) => (
                                                                    <motion.div
                                                                        key={
                                                                            symptom.id
                                                                        }
                                                                        initial={{
                                                                            opacity: 0,
                                                                            scale: 0.8,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                            scale: 1,
                                                                        }}
                                                                        transition={{
                                                                            delay:
                                                                                0.3 +
                                                                                i *
                                                                                    0.05,
                                                                            type: 'spring',
                                                                            stiffness: 300,
                                                                            damping: 20,
                                                                        }}
                                                                    >
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="gap-1.5"
                                                                            style={{
                                                                                borderColor: `${palette.muted}80`,
                                                                                backgroundColor: `${palette.muted}10`,
                                                                            }}
                                                                        >
                                                                            <span className="font-mono text-[10px]">
                                                                                {
                                                                                    symptom.code
                                                                                }
                                                                            </span>
                                                                            {
                                                                                symptom.name
                                                                            }
                                                                            <span className="text-muted-foreground">
                                                                                (
                                                                                {(
                                                                                    weight *
                                                                                    100
                                                                                ).toFixed(
                                                                                    0,
                                                                                )}
                                                                                %)
                                                                            </span>
                                                                        </Badge>
                                                                    </motion.div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </motion.div>

                                                    {/* Treatments */}
                                                    {topDisease.treatments
                                                        .length > 0 && (
                                                        <motion.div
                                                            className="space-y-3"
                                                            variants={fadeInUp}
                                                        >
                                                            <h4
                                                                className="text-sm font-semibold"
                                                                style={{
                                                                    color: palette.secondary,
                                                                }}
                                                            >
                                                                Penanganan &amp;
                                                                Dosis
                                                            </h4>
                                                            <div className="grid gap-3">
                                                                {topDisease.treatments
                                                                    .sort(
                                                                        (
                                                                            a,
                                                                            b,
                                                                        ) =>
                                                                            a.priority -
                                                                            b.priority,
                                                                    )
                                                                    .map(
                                                                        (
                                                                            treatment,
                                                                            i,
                                                                        ) => (
                                                                            <motion.div
                                                                                key={
                                                                                    treatment.id
                                                                                }
                                                                                className="rounded-lg border p-3"
                                                                                style={{
                                                                                    backgroundColor: `${palette.lightest}15`,
                                                                                }}
                                                                                initial={{
                                                                                    opacity: 0,
                                                                                    x: -20,
                                                                                }}
                                                                                animate={{
                                                                                    opacity: 1,
                                                                                    x: 0,
                                                                                }}
                                                                                transition={{
                                                                                    delay:
                                                                                        0.4 +
                                                                                        i *
                                                                                            0.08,
                                                                                }}
                                                                            >
                                                                                <div className="mb-1.5 flex items-center gap-2">
                                                                                    <Badge
                                                                                        variant={
                                                                                            TREATMENT_TYPE_VARIANTS[
                                                                                                treatment
                                                                                                    .type
                                                                                            ]
                                                                                        }
                                                                                        className="text-[10px]"
                                                                                    >
                                                                                        {
                                                                                            TREATMENT_TYPE_LABELS[
                                                                                                treatment
                                                                                                    .type
                                                                                            ]
                                                                                        }
                                                                                    </Badge>
                                                                                </div>
                                                                                <p className="text-sm">
                                                                                    {
                                                                                        treatment.description
                                                                                    }
                                                                                </p>
                                                                                {treatment.dosage && (
                                                                                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                                                                                        Dosis:{' '}
                                                                                        {
                                                                                            treatment.dosage
                                                                                        }
                                                                                        {treatment.dosage_unit
                                                                                            ? ` ${treatment.dosage_unit}`
                                                                                            : ''}
                                                                                    </p>
                                                                                )}
                                                                            </motion.div>
                                                                        ),
                                                                    )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    )}

                                    {/* -- All ranked results ---------------------- */}
                                    <motion.div variants={resultCardVariants}>
                                        <Card
                                            className="overflow-hidden border-t-4"
                                            style={{
                                                borderTopColor: palette.light,
                                            }}
                                        >
                                            <CardHeader>
                                                <CardTitle
                                                    className="text-base"
                                                    style={{
                                                        color: palette.primary,
                                                    }}
                                                >
                                                    Semua Kemungkinan Penyakit
                                                </CardTitle>
                                                <CardDescription>
                                                    Diurutkan berdasarkan
                                                    Certainty Factor tertinggi
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {filteredResults.map(
                                                        (result, index) => (
                                                            <motion.div
                                                                key={
                                                                    result
                                                                        .disease
                                                                        .id
                                                                }
                                                                className={`rounded-lg border p-3 ${
                                                                    index === 0
                                                                        ? 'border-transparent'
                                                                        : ''
                                                                }`}
                                                                style={
                                                                    index === 0
                                                                        ? {
                                                                              borderColor: `${palette.secondary}50`,
                                                                              backgroundColor: `${palette.secondary}08`,
                                                                          }
                                                                        : undefined
                                                                }
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 20,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                }}
                                                                transition={{
                                                                    delay:
                                                                        0.1 +
                                                                        index *
                                                                            0.08,
                                                                    type: 'spring',
                                                                    stiffness: 260,
                                                                    damping: 20,
                                                                }}
                                                            >
                                                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className="flex size-6 items-center justify-center rounded-full text-xs font-bold text-white"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    index ===
                                                                                    0
                                                                                        ? palette.primary
                                                                                        : index ===
                                                                                            1
                                                                                          ? palette.secondary
                                                                                          : palette.muted,
                                                                            }}
                                                                        >
                                                                            {index +
                                                                                1}
                                                                        </span>
                                                                        <span className="text-sm font-semibold">
                                                                            {
                                                                                result
                                                                                    .disease
                                                                                    .name
                                                                            }
                                                                        </span>
                                                                        {result
                                                                            .disease
                                                                            .latin_name && (
                                                                            <span className="text-xs italic text-muted-foreground">
                                                                                (
                                                                                {
                                                                                    result
                                                                                        .disease
                                                                                        .latin_name
                                                                                }
                                                                                )
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge
                                                                            variant={
                                                                                result.certaintyFactor >=
                                                                                60
                                                                                    ? 'default'
                                                                                    : result.certaintyFactor >=
                                                                                        30
                                                                                      ? 'secondary'
                                                                                      : 'outline'
                                                                            }
                                                                            style={
                                                                                result.certaintyFactor >=
                                                                                60
                                                                                    ? {
                                                                                          backgroundColor:
                                                                                              palette.primary,
                                                                                          color: '#fff',
                                                                                      }
                                                                                    : result.certaintyFactor >=
                                                                                        30
                                                                                      ? {
                                                                                            backgroundColor: `${palette.light}40`,
                                                                                            color: palette.primary,
                                                                                        }
                                                                                      : undefined
                                                                            }
                                                                        >
                                                                            {result.certaintyFactor.toFixed(
                                                                                2,
                                                                            )}
                                                                            %
                                                                        </Badge>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {cfLabel(
                                                                                result.certaintyFactor,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* CF progress bar */}
                                                                <AnimatedCFBar
                                                                    cf={
                                                                        result.certaintyFactor
                                                                    }
                                                                    height="h-2"
                                                                />

                                                                <p className="mt-1.5 text-xs text-muted-foreground">
                                                                    Gejala
                                                                    cocok:{' '}
                                                                    {
                                                                        result.matchingSymptoms
                                                                    }{' '}
                                                                    dari{' '}
                                                                    {
                                                                        result.totalSymptoms
                                                                    }
                                                                </p>
                                                            </motion.div>
                                                        ),
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* -- 9 Variables Summary --------------------- */}
                                    <motion.div variants={resultCardVariants}>
                                        <Card
                                            className="overflow-hidden border-t-4"
                                            style={{
                                                borderTopColor: palette.lightest,
                                            }}
                                        >
                                            <CardHeader>
                                                <CardTitle
                                                    className="text-base"
                                                    style={{
                                                        color: palette.primary,
                                                    }}
                                                >
                                                    Ringkasan 9 Variabel
                                                </CardTitle>
                                                <CardDescription>
                                                    Data lengkap yang digunakan
                                                    dalam proses diagnosa
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <motion.div
                                                    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                                                    variants={
                                                        containerVariants
                                                    }
                                                    initial="hidden"
                                                    animate="visible"
                                                >
                                                    {/* VAR 1: Gejala */}
                                                    <VariableItem
                                                        label="VAR 1 — Gejala Terpilih"
                                                        value={`${selectedIds.length} gejala`}
                                                    />
                                                    {/* VAR 2: Penyakit Terdeteksi */}
                                                    <VariableItem
                                                        label="VAR 2 — Penyakit Terdeteksi"
                                                        value={
                                                            topResult?.disease
                                                                .name ?? '-'
                                                        }
                                                    />
                                                    {/* VAR 3: Certainty Factor */}
                                                    <VariableItem
                                                        label="VAR 3 — Certainty Factor"
                                                        value={
                                                            topResult
                                                                ? `${topResult.certaintyFactor.toFixed(2)}%`
                                                                : '-'
                                                        }
                                                    />
                                                    {/* VAR 4: Suhu */}
                                                    <VariableItem
                                                        label="VAR 4 — Suhu"
                                                        value={
                                                            envData?.weather
                                                                ? `${envData.weather.temperature}°C`
                                                                : 'Tidak tersedia'
                                                        }
                                                    />
                                                    {/* VAR 5: Kelembapan */}
                                                    <VariableItem
                                                        label="VAR 5 — Kelembapan"
                                                        value={
                                                            envData?.weather
                                                                ? `${envData.weather.humidity}%`
                                                                : 'Tidak tersedia'
                                                        }
                                                    />
                                                    {/* VAR 6: Koordinat */}
                                                    <VariableItem
                                                        label="VAR 6 — Titik Koordinat"
                                                        value={
                                                            envData?.position
                                                                ? formatCoordinates(
                                                                      envData
                                                                          .position
                                                                          .latitude,
                                                                      envData
                                                                          .position
                                                                          .longitude,
                                                                  )
                                                                : 'Tidak tersedia'
                                                        }
                                                    />
                                                    {/* VAR 7: Koneksi */}
                                                    <VariableItem
                                                        label="VAR 7 — Status Koneksi"
                                                        value={
                                                            envData?.connectionStatus ===
                                                            'online'
                                                                ? 'Online'
                                                                : 'Offline'
                                                        }
                                                    />
                                                    {/* VAR 8: Jumlah Penyakit Kandidat */}
                                                    <VariableItem
                                                        label="VAR 8 — Kandidat Penyakit"
                                                        value={`${filteredResults.length} penyakit`}
                                                    />
                                                    {/* VAR 9: Validasi Server */}
                                                    <VariableItem
                                                        label="VAR 9 — Validasi Server"
                                                        value={
                                                            serverValidated
                                                                ? 'Tervalidasi'
                                                                : 'Belum divalidasi'
                                                        }
                                                    />
                                                </motion.div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* -- Save Button ----------------------------- */}
                                    <motion.div
                                        className="flex justify-end"
                                        variants={resultCardVariants}
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <Button
                                                onClick={handleSave}
                                                disabled={saving}
                                                size="lg"
                                                style={{
                                                    backgroundColor: saving
                                                        ? undefined
                                                        : palette.secondary,
                                                }}
                                            >
                                                {saving && (
                                                    <Spinner className="size-4" />
                                                )}
                                                Simpan Hasil
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function VariableItem({ label, value }: { label: string; value: string }) {
    return (
        <motion.div
            className="rounded-lg border p-3"
            style={{ backgroundColor: `${palette.lightest}15` }}
            variants={symptomItemVariants}
            whileHover={{
                scale: 1.02,
                backgroundColor: `${palette.light}18`,
            }}
        >
            <p
                className="text-xs font-medium"
                style={{ color: palette.secondary }}
            >
                {label}
            </p>
            <p className="mt-0.5 text-sm font-semibold">{value}</p>
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

ExpertSystem.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Sistem Pakar',
            href: '/expert-system',
        },
    ],
};
