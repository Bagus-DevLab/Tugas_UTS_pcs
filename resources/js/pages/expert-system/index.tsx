import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    diagnose,
    filterByThreshold,
    getTopDiagnosis,
    type DiagnosisResult,
    type DiseaseData,
    type SymptomData,
    type TreatmentData,
} from '@/lib/expert-system';
import {
    formatCoordinates,
    gatherEnvironmentData,
    type EnvironmentData,
} from '@/lib/geo-weather';

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
    if (cf >= 80) return 'Sangat Yakin';
    if (cf >= 60) return 'Yakin';
    if (cf >= 40) return 'Cukup Yakin';
    if (cf >= 20) return 'Kurang Yakin';
    return 'Tidak Yakin';
}

function cfColor(cf: number): string {
    if (cf >= 80) return 'bg-green-500';
    if (cf >= 60) return 'bg-emerald-500';
    if (cf >= 40) return 'bg-yellow-500';
    if (cf >= 20) return 'bg-orange-500';
    return 'bg-red-500';
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
        setEnvLoading(true);

        gatherEnvironmentData()
            .then((data) => {
                if (!cancelled) setEnvData(data);
            })
            .catch(() => {
                if (!cancelled)
                    setEnvData({
                        position: null,
                        weather: null,
                        connectionStatus: 'offline',
                        error: 'Gagal mengambil data lingkungan.',
                    });
            })
            .finally(() => {
                if (!cancelled) setEnvLoading(false);
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
        if (!topResult) return null;
        return diseases.find((d) => d.id === topResult.disease.id) ?? null;
    }, [topResult, diseases]);

    // -- Diagnose ------------------------------------------------------------
    const handleDiagnose = useCallback(async () => {
        if (selectedIds.length === 0) return;

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
        if (!results || results.length === 0 || !topResult) return;

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
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight">
                        Sistem Pakar Diagnosa Penyakit Padi
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pilih gejala yang terlihat pada tanaman padi Anda, lalu
                        tekan tombol &ldquo;Diagnosa&rdquo; untuk mendapatkan
                        hasil analisis.
                    </p>
                </div>

                {/* --------------------------------------------------------- */}
                {/* VAR 4, 6, 7 — Environment Info                           */}
                {/* --------------------------------------------------------- */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
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
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Titik Koordinat
                                    </p>
                                    <p className="text-sm font-medium">
                                        {envData.position
                                            ? formatCoordinates(
                                                  envData.position.latitude,
                                                  envData.position.longitude,
                                              )
                                            : 'Tidak tersedia'}
                                    </p>
                                </div>

                                {/* Suhu */}
                                <div className="space-y-1">
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
                                </div>

                                {/* Koneksi */}
                                <div className="space-y-1">
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
                                    >
                                        {envData.connectionStatus === 'online'
                                            ? 'Online'
                                            : 'Offline'}
                                    </Badge>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Data lingkungan tidak tersedia.
                            </p>
                        )}

                        {envData?.error && (
                            <p className="mt-3 text-xs text-orange-600 dark:text-orange-400">
                                {envData.error}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* --------------------------------------------------------- */}
                {/* Symptom Selection                                         */}
                {/* --------------------------------------------------------- */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Pilih Gejala
                        </CardTitle>
                        <CardDescription>
                            Centang gejala yang terlihat pada tanaman padi Anda (
                            {selectedIds.length} dipilih)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {symptoms.map((symptom) => {
                                const checked = selectedIds.includes(
                                    symptom.id,
                                );
                                return (
                                    <label
                                        key={symptom.id}
                                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                                            checked
                                                ? 'border-primary/50 bg-primary/5'
                                                : 'border-transparent bg-muted/40 hover:bg-muted/70'
                                        }`}
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
                                    </label>
                                );
                            })}
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                            {selectedIds.length === 0
                                ? 'Pilih minimal 1 gejala untuk memulai diagnosa.'
                                : `${selectedIds.length} gejala dipilih.`}
                        </p>
                        <Button
                            onClick={handleDiagnose}
                            disabled={
                                selectedIds.length === 0 || diagnosing
                            }
                            size="lg"
                        >
                            {diagnosing && <Spinner className="size-4" />}
                            Diagnosa
                        </Button>
                    </CardFooter>
                </Card>

                {/* --------------------------------------------------------- */}
                {/* Results                                                   */}
                {/* --------------------------------------------------------- */}
                {results !== null && (
                    <div ref={resultsRef} className="flex flex-col gap-6">
                        {filteredResults.length === 0 ? (
                            <Alert>
                                <AlertTitle>
                                    Tidak Ditemukan Penyakit
                                </AlertTitle>
                                <AlertDescription>
                                    Gejala yang dipilih tidak cocok dengan
                                    penyakit manapun dalam basis pengetahuan.
                                    Coba pilih gejala lain atau konsultasikan
                                    dengan ahli pertanian.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <>
                                {/* -- Top Result ----------------------------- */}
                                {topResult && topDisease && (
                                    <Card className="border-primary/30">
                                        <CardHeader>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <CardTitle className="text-lg">
                                                    Hasil Diagnosa Utama
                                                </CardTitle>
                                                {serverValidated && (
                                                    <Badge variant="secondary">
                                                        Tervalidasi Server
                                                    </Badge>
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
                                                    <h3 className="text-xl font-bold">
                                                        {topResult.disease.name}
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
                                                        <span className="font-medium">
                                                            Certainty Factor
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
                                                    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${cfColor(topResult.certaintyFactor)}`}
                                                            style={{
                                                                width: `${Math.min(topResult.certaintyFactor, 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <p className="text-sm text-muted-foreground">
                                                    Gejala cocok:{' '}
                                                    {topResult.matchingSymptoms}{' '}
                                                    dari{' '}
                                                    {topResult.totalSymptoms}{' '}
                                                    gejala
                                                </p>
                                            </div>

                                            {/* Description */}
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-semibold">
                                                    Deskripsi
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {topResult.disease
                                                        .description}
                                                </p>
                                            </div>

                                            {/* Cause */}
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-semibold">
                                                    Penyebab
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {topResult.disease.cause}
                                                </p>
                                            </div>

                                            {/* Matched symptoms */}
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold">
                                                    Gejala yang Cocok
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {topResult.matchedSymptomDetails.map(
                                                        ({ symptom, weight }) => (
                                                            <Badge
                                                                key={symptom.id}
                                                                variant="outline"
                                                                className="gap-1.5"
                                                            >
                                                                <span className="font-mono text-[10px]">
                                                                    {symptom.code}
                                                                </span>
                                                                {symptom.name}
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
                                                        ),
                                                    )}
                                                </div>
                                            </div>

                                            {/* Treatments */}
                                            {topDisease.treatments.length >
                                                0 && (
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold">
                                                        Penanganan &amp; Dosis
                                                    </h4>
                                                    <div className="grid gap-3">
                                                        {topDisease.treatments
                                                            .sort(
                                                                (a, b) =>
                                                                    a.priority -
                                                                    b.priority,
                                                            )
                                                            .map(
                                                                (treatment) => (
                                                                    <div
                                                                        key={
                                                                            treatment.id
                                                                        }
                                                                        className="rounded-lg border bg-muted/30 p-3"
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
                                                                    </div>
                                                                ),
                                                            )}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* -- All ranked results ---------------------- */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            Semua Kemungkinan Penyakit
                                        </CardTitle>
                                        <CardDescription>
                                            Diurutkan berdasarkan Certainty
                                            Factor tertinggi
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {filteredResults.map(
                                                (result, index) => (
                                                    <div
                                                        key={result.disease.id}
                                                        className={`rounded-lg border p-3 ${
                                                            index === 0
                                                                ? 'border-primary/30 bg-primary/5'
                                                                : ''
                                                        }`}
                                                    >
                                                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                                                    {index + 1}
                                                                </span>
                                                                <span className="text-sm font-semibold">
                                                                    {
                                                                        result
                                                                            .disease
                                                                            .name
                                                                    }
                                                                </span>
                                                                {result.disease
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
                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${cfColor(result.certaintyFactor)}`}
                                                                style={{
                                                                    width: `${Math.min(result.certaintyFactor, 100)}%`,
                                                                }}
                                                            />
                                                        </div>

                                                        <p className="mt-1.5 text-xs text-muted-foreground">
                                                            Gejala cocok:{' '}
                                                            {
                                                                result.matchingSymptoms
                                                            }{' '}
                                                            dari{' '}
                                                            {
                                                                result.totalSymptoms
                                                            }
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* -- 9 Variables Summary --------------------- */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            Ringkasan 9 Variabel
                                        </CardTitle>
                                        <CardDescription>
                                            Data lengkap yang digunakan dalam
                                            proses diagnosa
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {/* VAR 1: Gejala */}
                                            <VariableItem
                                                label="VAR 1 — Gejala Terpilih"
                                                value={`${selectedIds.length} gejala`}
                                            />
                                            {/* VAR 2: Penyakit Terdeteksi */}
                                            <VariableItem
                                                label="VAR 2 — Penyakit Terdeteksi"
                                                value={
                                                    topResult?.disease.name ??
                                                    '-'
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
                                                              envData.position
                                                                  .latitude,
                                                              envData.position
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
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* -- Save Button ----------------------------- */}
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        size="lg"
                                    >
                                        {saving && (
                                            <Spinner className="size-4" />
                                        )}
                                        Simpan Hasil
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function VariableItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-sm font-semibold">{value}</p>
        </div>
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
