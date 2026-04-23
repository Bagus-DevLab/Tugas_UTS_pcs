import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, BrainCircuit, Bug, ScanLine, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

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

// Palette: Sand #DDD8C4, Sage #A3C9A8, Leaf #84B59F, Teal #69A297, Deep #50808E
const CHART_COLORS = ['#50808E', '#84B59F', '#A3C9A8', '#69A297', '#DDD8C4'];

const STAT_CARDS_META = [
    { icon: Activity, color: '#50808E', bg: 'rgba(80,128,142,0.12)' },
    { icon: TrendingUp, color: '#69A297', bg: 'rgba(105,162,151,0.12)' },
    { icon: BarChart3, color: '#84B59F', bg: 'rgba(132,181,159,0.12)' },
    { icon: Bug, color: '#A3C9A8', bg: 'rgba(163,201,168,0.12)' },
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

export default function Dashboard({ stats, diseaseDistribution, recentDetections }: Props) {
    const statData = [
        { label: 'Total Deteksi', value: String(stats.totalDetections), sub: 'Seluruh riwayat deteksi' },
        { label: 'Deteksi Bulan Ini', value: String(stats.detectionsThisMonth), sub: 'Bulan berjalan' },
        { label: 'Rata-rata Akurasi', value: `${stats.averageConfidence.toFixed(1)}%`, sub: 'Tingkat kepercayaan model' },
        { label: 'Penyakit Terbanyak', value: stats.mostDetectedDisease || '-', sub: 'Paling sering terdeteksi', truncate: true },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Stat Cards — staggered fade-in */}
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
                                <Card className="relative overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
                                        style={{ backgroundColor: meta.color }}
                                    />
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardDescription>{stat.label}</CardDescription>
                                        <div
                                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                                            style={{ backgroundColor: meta.bg }}
                                        >
                                            <Icon className="h-4 w-4" style={{ color: meta.color }} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${stat.truncate ? 'truncate' : ''}`}>
                                            {stat.value}
                                        </div>
                                        <p className="text-muted-foreground text-xs">{stat.sub}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Charts & Quick Actions — fade-in */}
                <motion.div
                    className="grid gap-4 lg:grid-cols-3"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Disease Distribution Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Distribusi Penyakit</CardTitle>
                            <CardDescription>Sebaran penyakit yang terdeteksi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {diseaseDistribution.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <ResponsiveContainer width="100%" height={250}>
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
                                                    border: '1px solid #DDD8C4',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={diseaseDistribution} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#DDD8C4" />
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
                                                    border: '1px solid #DDD8C4',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                }}
                                            />
                                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
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
                                <div className="text-muted-foreground flex h-[250px] items-center justify-center text-sm">
                                    Belum ada data deteksi
                                </div>
                            )}
                        </CardContent>
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
                                className="w-full justify-start text-white"
                                style={{ backgroundColor: '#50808E' }}
                            >
                                <Link href="/detection">
                                    <ScanLine className="mr-2 h-4 w-4" />
                                    Deteksi Baru
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full justify-start border-teal text-deep hover:bg-teal/10"
                            >
                                <Link href="/expert-system">
                                    <BrainCircuit className="mr-2 h-4 w-4" style={{ color: '#69A297' }} />
                                    Sistem Pakar
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full justify-start border-leaf text-deep hover:bg-leaf/10"
                            >
                                <Link href="/diseases">
                                    <Bug className="mr-2 h-4 w-4" style={{ color: '#84B59F' }} />
                                    Knowledge Base
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Detections Table — fade-in */}
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
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-muted-foreground border-b text-left">
                                                <th className="pb-3 pr-4 font-medium">Tanggal</th>
                                                <th className="pb-3 pr-4 font-medium">Label</th>
                                                <th className="pb-3 pr-4 font-medium">Akurasi</th>
                                                <th className="pb-3 font-medium">Metode</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentDetections.map((detection, i) => (
                                                <motion.tr
                                                    key={detection.id}
                                                    className="border-b last:border-0"
                                                    initial={{ opacity: 0, x: -12 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: 0.05 * i,
                                                        ease: 'easeOut',
                                                    }}
                                                >
                                                    <td className="py-3 pr-4 whitespace-nowrap">
                                                        {formatDate(detection.created_at)}
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        {detection.disease ? (
                                                            <Link
                                                                href={`/diseases/${detection.disease.slug}`}
                                                                className="font-medium text-deep hover:text-teal hover:underline"
                                                            >
                                                                {detection.disease.name}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                {detection.label || '-'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        {detection.confidence !== null ? (
                                                            <Badge
                                                                variant={
                                                                    detection.confidence >= 80
                                                                        ? 'default'
                                                                        : detection.confidence >= 50
                                                                          ? 'secondary'
                                                                          : 'destructive'
                                                                }
                                                            >
                                                                {detection.confidence.toFixed(1)}%
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3">
                                                        <Badge variant="outline">
                                                            {formatMethod(detection.method)}
                                                        </Badge>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-muted-foreground py-8 text-center text-sm">
                                    Belum ada riwayat deteksi. Mulai deteksi pertama Anda!
                                </div>
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
