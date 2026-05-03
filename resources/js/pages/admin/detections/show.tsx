import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, MapPin, Thermometer, Clock, Wifi, WifiOff, Image as ImageIcon, FlaskConical, Pill, Activity, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const palette = {
    primary: '#059669',
    secondary: '#10b981',
    muted: '#64748b',
    light: '#94a3b8',
    lightest: '#cbd5e1',
};

interface Props {
    detection: {
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
        user?: { id: number; name: string; email: string } | null;
        disease?: {
            id: number;
            name: string;
            slug: string;
            latin_name: string | null;
            description: string;
            symptoms?: Array<{ id: number; code: string; name: string }>;
            treatments?: Array<{ id: number; type: string; description: string; dosage: string | null; dosage_unit: string | null; priority: number }>;
        } | null;
    };
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'medium' });
}

function getTreatmentTypeLabel(type: string): string {
    const map: Record<string, string> = { chemical: 'Kimia', biological: 'Biologis', prevention: 'Pencegahan', cultural: 'Kultur Teknis' };

    return map[type] ?? type;
}

export default function AdminDetectionShow({ detection }: Props) {
    const confidence = detection.confidence ? Math.round(Number(detection.confidence) * 10) / 10 : null;

    return (
        <>
            <Head title={`Detail Deteksi #${detection.id} - Admin`} />
            <div className="mx-auto max-w-5xl space-y-6 p-4">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/detections"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: palette.primary }}>Detail Deteksi #{detection.id}</h1>
                        <p className="text-sm text-muted-foreground">Admin View</p>
                    </div>
                </motion.div>

                {/* User info card */}
                {detection.user && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card style={{ borderColor: palette.secondary }}>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${palette.secondary}20` }}>
                                    <UserIcon className="h-5 w-5" style={{ color: palette.secondary }} />
                                </div>
                                <div>
                                    <p className="font-semibold">{detection.user.name}</p>
                                    <p className="text-sm text-muted-foreground">{detection.user.email}</p>
                                </div>
                                <Badge variant="outline" className="ml-auto">{detection.method === 'image' ? 'Image' : 'Expert System'}</Badge>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* 9 Variables Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* VAR 1: Citra Daun */}
                    {detection.image_path && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="md:row-span-2">
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><ImageIcon className="h-4 w-4" style={{ color: palette.secondary }} /> Citra Daun</CardTitle></CardHeader>
                                <CardContent><img src={`/storage/${detection.image_path}`} alt="Citra daun" className="w-full rounded-lg object-cover" /></CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* VAR 2: Label Penyakit */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Activity className="h-4 w-4" style={{ color: palette.secondary }} /> Label Penyakit</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-xl font-bold" style={{ color: palette.primary }}>{detection.label ?? '-'}</p>
                                {detection.disease?.latin_name && <p className="text-sm italic text-muted-foreground">{detection.disease.latin_name}</p>}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* VAR 3: Tingkat Akurasi */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm">Tingkat Akurasi</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold" style={{ color: palette.primary }}>{confidence !== null ? `${confidence}%` : '-'}</p>
                                {confidence !== null && (
                                    <div className="mt-2 h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: `${palette.lightest}40` }}>
                                        <motion.div className="h-full rounded-full" style={{ backgroundColor: confidence >= 80 ? palette.light : confidence >= 50 ? palette.secondary : '#c45c5c' }} initial={{ width: 0 }} animate={{ width: `${confidence}%` }} transition={{ duration: 0.8 }} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* VAR 4: Suhu */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Thermometer className="h-4 w-4" style={{ color: palette.secondary }} /> Suhu</CardTitle></CardHeader>
                            <CardContent><p className="text-2xl font-bold">{detection.temperature !== null ? `${detection.temperature}°C` : '-'}</p></CardContent>
                        </Card>
                    </motion.div>

                    {/* VAR 5: Waktu Pemindaian */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4" style={{ color: palette.secondary }} /> Waktu Pemindaian</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-sm font-medium">{detection.scanned_at ? formatDate(detection.scanned_at) : '-'}</p>
                                {detection.scan_duration_ms !== null && <p className="text-xs text-muted-foreground">Durasi: {detection.scan_duration_ms} ms</p>}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* VAR 6: Titik Koordinat */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" style={{ color: palette.secondary }} /> Titik Koordinat</CardTitle></CardHeader>
                            <CardContent>
                                {detection.latitude !== null && detection.longitude !== null ? (
                                    <div>
                                        <p className="text-sm font-mono">{Number(detection.latitude).toFixed(6)}, {Number(detection.longitude).toFixed(6)}</p>
                                        <a href={`https://www.google.com/maps?q=${detection.latitude},${detection.longitude}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs hover:underline" style={{ color: palette.secondary }}>
                                            Buka Maps <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                ) : <p className="text-sm text-muted-foreground">-</p>}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* VAR 7: Status Koneksi */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm">{detection.connection_status === 'online' ? <Wifi className="h-4 w-4" style={{ color: palette.light }} /> : <WifiOff className="h-4 w-4 text-red-500" />} Status Koneksi</CardTitle></CardHeader>
                            <CardContent>
                                <Badge style={detection.connection_status === 'online' ? { backgroundColor: `${palette.light}20`, color: palette.primary } : { backgroundColor: '#fee2e2', color: '#dc2626' }}>
                                    {detection.connection_status === 'online' ? 'Online' : 'Offline'}
                                </Badge>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* VAR 8: Rekomendasi Tindakan */}
                    {detection.disease?.treatments && detection.disease.treatments.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="md:col-span-2 lg:col-span-3">
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><FlaskConical className="h-4 w-4" style={{ color: palette.secondary }} /> Rekomendasi Tindakan & Dosis</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {[...detection.disease.treatments].sort((a, b) => a.priority - b.priority).map((t) => (
                                            <div key={t.id} className="flex items-start gap-3 rounded-lg border p-3" style={{ borderColor: palette.lightest }}>
                                                <Badge variant="outline" className="shrink-0 text-[10px]" style={{ borderColor: palette.secondary, color: palette.primary }}>{getTreatmentTypeLabel(t.type)}</Badge>
                                                <div className="flex-1">
                                                    <p className="text-sm">{t.description}</p>
                                                    {t.dosage && (
                                                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Pill className="h-3 w-3" /> {t.dosage} {t.dosage_unit}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Predictions */}
                    {detection.predictions && Object.keys(detection.predictions).length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="md:col-span-2 lg:col-span-3">
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm">Semua Prediksi</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(detection.predictions).sort(([, a], [, b]) => (b as number) - (a as number)).map(([label, conf]) => (
                                            <div key={label} className="flex items-center gap-3 text-sm">
                                                <span className="w-40 shrink-0 truncate">{label}</span>
                                                <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: `${palette.lightest}40` }}>
                                                    <div className="h-full rounded-full" style={{ width: `${conf}%`, backgroundColor: palette.secondary }} />
                                                </div>
                                                <span className="w-14 text-right font-mono text-xs">{Number(conf).toFixed(1)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}

AdminDetectionShow.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '/admin/detections' },
        { title: 'Semua Deteksi', href: '/admin/detections' },
        { title: 'Detail', href: '#' },
    ],
};
