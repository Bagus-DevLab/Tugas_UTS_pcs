import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, BrainCircuit, Bug, Info, ScanLine, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dashboard } from '@/routes';

// keep Skeleton import available for future use
void Skeleton;

interface Props {
    stats: {
        totalDetections: number;
        detectionsThisMonth: number;
        averageConfidence: number;
        mostDetectedDisease: string;
    };
    diseaseDistribution: Array<{ name: string; count: number }>;
    recentDetections: Array<{
        id: number;
        method: string;
        label: string | null;
        confidence: number | null;
        created_at: string;
        disease?: { id: number; name: string; slug: string } | null;
    }>;
}

const COLORS = {
    primary: '#059669',
    secondary: '#10b981',
    muted: '#64748b',
    light: '#94a3b8',
    lightest: '#cbd5e1',
} as const;

const CHART_COLORS = [COLORS.primary, COLORS.muted, COLORS.light, COLORS.secondary, COLORS.lightest];

const STAT_CARDS_META = [
    { icon: Activity, color: COLORS.primary, bg: 'rgba(80,128,142,0.10)', gradient: 'linear-gradient(135deg, rgba(80,128,142,0.06) 0%, rgba(80,128,142,0.02) 100%)' },
    { icon: TrendingUp, color: COLORS.secondary, bg: 'rgba(105,162,151,0.10)', gradient: 'linear-gradient(135deg, rgba(105,162,151,0.06) 0%, rgba(105,162,151,0.02) 100%)' },
    { icon: BarChart3, color: COLORS.muted, bg: 'rgba(132,181,159,0.10)', gradient: 'linear-gradient(135deg, rgba(132,181,159,0.06) 0%, rgba(132,181,159,0.02) 100%)' },
    { icon: Bug, color: COLORS.light, bg: 'rgba(163,201,168,0.10)', gradient: 'linear-gradient(135deg, rgba(163,201,168,0.06) 0%, rgba(163,201,168,0.02) 100%)' },
] as const;

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.1 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatMethod(method: string): string {
    switch (method) {
        case 'image':
            return 'Deteksi Gambar';
        case 'expert_system':
            return 'Sistem Pakar';
        default:
            return method;
    }
}

function getConfidenceBadgeVariant(confidence: number): 'default' | 'secondary' | 'destructive' {
    if (confidence >= 80) {
return 'default';
}

    if (confidence >= 50) {
return 'secondary';
}

    return 'destructive';
}

export default function Dashboard({ stats, diseaseDistribution, recentDetections }: Props) {
    const statData = [
        { label: 'Total Deteksi', value: String(stats.totalDetections), sub: 'Seluruh riwayat deteksi' },
        { label: 'Deteksi Bulan Ini', value: String(stats.detectionsThisMonth), sub: 'Bulan berjalan' },
        { label: 'Rata-rata Akurasi', value: `${stats.averageConfidence.toFixed(1)}%`, sub: 'Tingkat kepercayaan model', showProgress: true, progressValue: stats.averageConfidence },
        { label: 'Penyakit Terbanyak', value: stats.mostDetectedDisease || '-', sub: 'Paling sering terdeteksi', truncate: true },
    ];

    // Data for "Per Metode" bar chart tab
    const methodDistribution = useMemo(() => {
        const counts: Record<string, number> = { image: 0, expert_system: 0 };
        recentDetections.forEach((d) => {
            if (d.method in counts) {
                counts[d.method]++;
            }
        });

        return [
            { name: 'Deteksi Gambar', count: counts.image, fill: COLORS.primary },
            { name: 'Sistem Pakar', count: counts.expert_system, fill: COLORS.secondary },
        ];
    }, [recentDetections]);

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto p-4 md:p-6">
                {/* ── Stat Cards ── */}
                <motion.div
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {statData.map((stat, i) => {
                        const meta = STAT_CARDS_META[i];
                        const Icon = meta.icon;

                        return (
                            <motion.div key={stat.label} variants={cardVariants}>
                                <Card className="relative overflow-hidden border-0 shadow-sm" style={{ background: meta.gradient }}>
                                    {/* Left accent bar */}
                                    <div
                                        className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
                                        style={{ backgroundColor: meta.color }}
                                    />
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardDescription className="text-xs font-medium uppercase tracking-wide">
                                            {stat.label}
                                        </CardDescription>
                                        <div
                                            className="flex h-9 w-9 items-center justify-center rounded-xl"
                                            style={{ backgroundColor: meta.bg }}
                                        >
                                            <Icon className="h-4 w-4" style={{ color: meta.color }} />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className={`text-2xl font-bold tracking-tight ${stat.truncate ? 'truncate' : ''}`}>
                                            {stat.value}
                                        </div>
                                        {stat.showProgress && (
                                            <Progress
                                                value={stat.progressValue}
                                                className="h-2"
                                                style={
                                                    {
                                                        '--tw-bg-opacity': '0.15',
                                                        backgroundColor: `${meta.color}26`,
                                                    } as React.CSSProperties
                                                }
                                            />
                                        )}
                                        <p className="text-muted-foreground text-xs">{stat.sub}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <Separator className="opacity-50" />

                {/* ── Charts & Quick Actions ── */}
                <motion.div
                    className="grid gap-6 lg:grid-cols-3"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Charts with Tabs */}
                    <Card className="lg:col-span-2">
                        <Tabs defaultValue="distribusi">
                            <CardHeader>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <CardTitle>Analisis Penyakit</CardTitle>
                                        <CardDescription>Visualisasi data deteksi penyakit padi</CardDescription>
                                    </div>
                                    <TabsList>
                                        <TabsTrigger value="distribusi">Distribusi Penyakit</TabsTrigger>
                                        <TabsTrigger value="metode">Per Metode</TabsTrigger>
                                    </TabsList>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Tab: Distribusi Penyakit */}
                                <TabsContent value="distribusi" className="mt-0">
                                    {diseaseDistribution.length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <ResponsiveContainer width="100%" height={260}>
                                                <PieChart>
                                                    <Pie
                                                        data={diseaseDistribution}
                                                        dataKey="count"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={90}
                                                        innerRadius={50}
                                                        paddingAngle={2}
                                                        label={({ name, percent }) =>
                                                            `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                                                        }
                                                        labelLine={false}
                                                    >
                                                        {diseaseDistribution.map((_, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            borderRadius: '8px',
                                                            border: `1px solid ${COLORS.lightest}`,
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                            fontSize: '13px',
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <ResponsiveContainer width="100%" height={260}>
                                                <BarChart data={diseaseDistribution} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.lightest} />
                                                    <XAxis type="number" allowDecimals={false} />
                                                    <YAxis
                                                        type="category"
                                                        dataKey="name"
                                                        width={120}
                                                        tick={{ fontSize: 12 }}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            borderRadius: '8px',
                                                            border: `1px solid ${COLORS.lightest}`,
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                            fontSize: '13px',
                                                        }}
                                                    />
                                                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                                                        {diseaseDistribution.map((_, index) => (
                                                            <Cell
                                                                key={`bar-${index}`}
                                                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertTitle>Belum ada data</AlertTitle>
                                            <AlertDescription>
                                                Data distribusi penyakit akan muncul setelah Anda melakukan deteksi pertama.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </TabsContent>

                                {/* Tab: Per Metode */}
                                <TabsContent value="metode" className="mt-0">
                                    {recentDetections.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={methodDistribution} barCategoryGap="30%">
                                                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.lightest} />
                                                <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip
                                                    contentStyle={{
                                                        borderRadius: '8px',
                                                        border: `1px solid ${COLORS.lightest}`,
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                        fontSize: '13px',
                                                    }}
                                                />
                                                <Legend />
                                                <Bar dataKey="count" name="Jumlah Deteksi" radius={[6, 6, 0, 0]}>
                                                    {methodDistribution.map((entry, index) => (
                                                        <Cell key={`method-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertTitle>Belum ada data</AlertTitle>
                                            <AlertDescription>
                                                Data per metode akan muncul setelah Anda melakukan deteksi.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Aksi Cepat</CardTitle>
                            <CardDescription>Mulai analisis penyakit padi</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <Button
                                asChild
                                className="w-full justify-start text-white transition-all hover:brightness-110"
                                style={{ backgroundColor: COLORS.primary }}
                            >
                                <Link href="/detection">
                                    <ScanLine className="mr-2 h-4 w-4" />
                                    Deteksi Baru
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full justify-start transition-all hover:bg-[rgba(105,162,151,0.08)]"
                                style={{ borderColor: COLORS.secondary, color: COLORS.primary }}
                            >
                                <Link href="/expert-system">
                                    <BrainCircuit className="mr-2 h-4 w-4" style={{ color: COLORS.secondary }} />
                                    Sistem Pakar
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full justify-start transition-all hover:bg-[rgba(132,181,159,0.08)]"
                                style={{ borderColor: COLORS.muted, color: COLORS.primary }}
                            >
                                <Link href="/diseases">
                                    <Bug className="mr-2 h-4 w-4" style={{ color: COLORS.muted }} />
                                    Knowledge Base
                                </Link>
                            </Button>

                            <Separator className="my-2 opacity-50" />

                            {/* Mini summary */}
                            <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(80,128,142,0.05)' }}>
                                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Ringkasan Cepat</p>
                                <div className="mt-2 space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Total deteksi</span>
                                        <span className="font-semibold">{stats.totalDetections}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Bulan ini</span>
                                        <span className="font-semibold">{stats.detectionsThisMonth}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Akurasi</span>
                                        <span className="font-semibold">{stats.averageConfidence.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <Separator className="opacity-50" />

                {/* ── Recent Detections Table ── */}
                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Deteksi Terbaru</CardTitle>
                                <CardDescription>5 hasil deteksi terakhir</CardDescription>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/detection/history">Lihat Semua</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentDetections.length > 0 ? (
                                <ScrollArea className="w-full">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tanggal</TableHead>
                                                <TableHead>Penyakit</TableHead>
                                                <TableHead>Akurasi</TableHead>
                                                <TableHead>Metode</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentDetections.map((detection, i) => (
                                                <motion.tr
                                                    key={detection.id}
                                                    className="border-b transition-colors last:border-0 hover:bg-muted/50"
                                                    initial={{ opacity: 0, x: -12 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: 0.05 * i,
                                                        ease: 'easeOut',
                                                    }}
                                                >
                                                    <TableCell className="whitespace-nowrap">
                                                        {formatDate(detection.created_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {detection.disease ? (
                                                            <HoverCard>
                                                                <HoverCardTrigger asChild>
                                                                    <Link
                                                                        href={`/diseases/${detection.disease.slug}`}
                                                                        className="font-medium underline-offset-4 transition-colors hover:underline"
                                                                        style={{ color: COLORS.primary }}
                                                                    >
                                                                        {detection.disease.name}
                                                                    </Link>
                                                                </HoverCardTrigger>
                                                                <HoverCardContent className="w-72" side="top">
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <Bug className="h-4 w-4" style={{ color: COLORS.muted }} />
                                                                            <p className="text-sm font-semibold">{detection.disease.name}</p>
                                                                        </div>
                                                                        <Separator />
                                                                        <p className="text-muted-foreground text-xs leading-relaxed">
                                                                            Klik untuk melihat detail lengkap tentang penyakit ini, termasuk gejala, penyebab, dan cara penanganannya.
                                                                        </p>
                                                                        <div className="flex items-center gap-2 pt-1">
                                                                            <Badge variant="outline" className="text-xs">
                                                                                {formatMethod(detection.method)}
                                                                            </Badge>
                                                                            {detection.confidence !== null && (
                                                                                <Badge
                                                                                    variant={getConfidenceBadgeVariant(detection.confidence)}
                                                                                    className="text-xs"
                                                                                >
                                                                                    {Number(detection.confidence).toFixed(1)}%
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </HoverCardContent>
                                                            </HoverCard>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                {detection.label || '-'}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {detection.confidence !== null ? (
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={getConfidenceBadgeVariant(detection.confidence)}>
                                                                    {Number(detection.confidence).toFixed(1)}%
                                                                </Badge>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            style={{
                                                                borderColor: detection.method === 'image' ? COLORS.primary : COLORS.secondary,
                                                                color: detection.method === 'image' ? COLORS.primary : COLORS.secondary,
                                                            }}
                                                        >
                                                            {detection.method === 'image' ? (
                                                                <ScanLine className="mr-1 h-3 w-3" />
                                                            ) : (
                                                                <BrainCircuit className="mr-1 h-3 w-3" />
                                                            )}
                                                            {formatMethod(detection.method)}
                                                        </Badge>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            ) : (
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Belum ada riwayat</AlertTitle>
                                    <AlertDescription>
                                        Belum ada riwayat deteksi. Mulai deteksi pertama Anda melalui menu <strong>Aksi Cepat</strong> di atas!
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
