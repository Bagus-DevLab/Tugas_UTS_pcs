import { Head, Link } from '@inertiajs/react';
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
    if (ms === null) return '-';
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(2)} detik`;
}

function formatConfidencePercent(confidence: number | null): number {
    if (confidence === null) return 0;
    return Math.round(confidence * 100 * 10) / 10;
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
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/detection/history">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Detail Deteksi</h1>
                        <p className="text-sm text-muted-foreground">
                            ID #{detection.id} &middot; {detection.method === 'image' ? 'Deteksi Citra' : 'Sistem Pakar'}
                        </p>
                    </div>
                </div>

                {/* Main Grid - 9 Variables */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* 1. Citra Daun */}
                    <Card className="md:row-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <ImageIcon className="size-4" />
                                Citra Daun
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {detection.image_path ? (
                                <div className="overflow-hidden rounded-lg border">
                                    <img
                                        src={`/storage/${detection.image_path}`}
                                        alt="Citra daun padi"
                                        className="aspect-square w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed bg-muted/30">
                                    <div className="text-center">
                                        <ImageIcon className="mx-auto mb-2 size-10 text-muted-foreground/40" />
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

                    {/* 2. Label Penyakit */}
                    <Card className="md:col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <FlaskConical className="size-4" />
                                Label Penyakit
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h2 className="text-2xl font-bold tracking-tight">
                                {detection.disease?.name || detection.label || 'Tidak Terdeteksi'}
                            </h2>
                            {detection.disease?.latin_name && (
                                <p className="mt-1 text-sm italic text-muted-foreground">
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

                    {/* 3. Tingkat Akurasi */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Activity className="size-4" />
                                Tingkat Akurasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {detection.confidence !== null ? (
                                <div>
                                    <div className="mb-2 flex items-baseline gap-1">
                                        <span className="text-3xl font-bold tabular-nums">
                                            {confidencePercent}
                                        </span>
                                        <span className="text-lg text-muted-foreground">%</span>
                                    </div>
                                    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                confidencePercent >= 80
                                                    ? 'bg-green-500'
                                                    : confidencePercent >= 50
                                                      ? 'bg-yellow-500'
                                                      : 'bg-red-500'
                                            }`}
                                            style={{ width: `${Math.min(confidencePercent, 100)}%` }}
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

                    {/* 4. Suhu */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Thermometer className="size-4" />
                                Suhu
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {detection.temperature !== null ? (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold tabular-nums">
                                        {detection.temperature.toFixed(1)}
                                    </span>
                                    <span className="text-lg text-muted-foreground">°C</span>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Tidak tersedia</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* 5. Waktu Pemindaian */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Clock className="size-4" />
                                Waktu Pemindaian
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium">
                                {formatDateTime(detection.scanned_at || detection.created_at)}
                            </p>
                            {detection.scan_duration_ms !== null && (
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                    Durasi: {formatDuration(detection.scan_duration_ms)}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* 6. Titik Koordinat */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <MapPin className="size-4" />
                                Titik Koordinat
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {detection.latitude !== null && detection.longitude !== null ? (
                                <div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">Lat:</span>
                                            <span className="font-mono font-medium">
                                                {detection.latitude.toFixed(6)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">Long:</span>
                                            <span className="font-mono font-medium">
                                                {detection.longitude.toFixed(6)}
                                            </span>
                                        </div>
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps?q=${detection.latitude},${detection.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
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

                    {/* 7. Status Koneksi */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                {detection.connection_status === 'online' ? (
                                    <Wifi className="size-4" />
                                ) : (
                                    <WifiOff className="size-4" />
                                )}
                                Status Koneksi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge
                                variant={detection.connection_status === 'online' ? 'default' : 'destructive'}
                                className="text-sm"
                            >
                                <span
                                    className={`mr-1.5 inline-block size-2 rounded-full ${
                                        detection.connection_status === 'online'
                                            ? 'bg-green-300'
                                            : 'bg-red-300'
                                    }`}
                                />
                                {detection.connection_status === 'online' ? 'Online' : 'Offline'}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* 8. Rekomendasi Tindakan */}
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <FlaskConical className="size-4" />
                                Rekomendasi Tindakan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {treatments.length > 0 ? (
                                <div className="space-y-3">
                                    {treatments.map((treatment, index) => (
                                        <div
                                            key={treatment.id}
                                            className="flex gap-3 rounded-lg border p-3"
                                        >
                                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {getTreatmentTypeLabel(treatment.type)}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm leading-relaxed">
                                                    {treatment.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Belum ada rekomendasi tindakan untuk penyakit ini.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* 9. Dosis */}
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Pill className="size-4" />
                                Dosis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {treatments.filter((t) => t.dosage).length > 0 ? (
                                <div className="rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>No</TableHead>
                                                <TableHead>Tindakan</TableHead>
                                                <TableHead>Jenis</TableHead>
                                                <TableHead>Dosis</TableHead>
                                                <TableHead>Satuan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {treatments
                                                .filter((t) => t.dosage)
                                                .map((treatment, index) => (
                                                    <TableRow key={treatment.id}>
                                                        <TableCell className="text-muted-foreground">
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell className="max-w-xs truncate font-medium">
                                                            {treatment.description}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="text-xs">
                                                                {getTreatmentTypeLabel(treatment.type)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="font-mono">
                                                            {treatment.dosage}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {treatment.dosage_unit || '-'}
                                                        </TableCell>
                                                    </TableRow>
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
                </div>

                {/* Predictions Chart (Image method) */}
                {detection.method === 'image' && sortedPredictions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Distribusi Prediksi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {sortedPredictions.map(([label, score]) => {
                                    const percent = Math.round(score * 100 * 10) / 10;
                                    const isTop = score === maxPrediction;
                                    return (
                                        <div key={label}>
                                            <div className="mb-1 flex items-center justify-between text-sm">
                                                <span className={isTop ? 'font-semibold' : 'text-muted-foreground'}>
                                                    {label}
                                                </span>
                                                <span className={`font-mono text-xs ${isTop ? 'font-semibold' : 'text-muted-foreground'}`}>
                                                    {percent}%
                                                </span>
                                            </div>
                                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        isTop ? 'bg-primary' : 'bg-muted-foreground/30'
                                                    }`}
                                                    style={{ width: `${Math.min(percent, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Selected Symptoms (Expert System method) */}
                {detection.method === 'expert_system' && matchedSymptoms && matchedSymptoms.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Gejala yang Dipilih</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {matchedSymptoms.map((symptom) => (
                                    <div
                                        key={symptom.id}
                                        className="flex items-start gap-2 rounded-lg border p-3"
                                    >
                                        <Badge variant="secondary" className="shrink-0 font-mono text-xs">
                                            {symptom.code}
                                        </Badge>
                                        <span className="text-sm">{symptom.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Notes */}
                {detection.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Catatan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {detection.notes}
                            </p>
                        </CardContent>
                    </Card>
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
