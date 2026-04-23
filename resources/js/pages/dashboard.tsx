import { Head, Link } from '@inertiajs/react';
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

const CHART_COLORS = [
    'var(--color-chart-1, #2563eb)',
    'var(--color-chart-2, #16a34a)',
    'var(--color-chart-3, #ea580c)',
    'var(--color-chart-4, #8b5cf6)',
    'var(--color-chart-5, #d946ef)',
    'var(--color-chart-6, #0891b2)',
];

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
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardDescription>Total Deteksi</CardDescription>
                            <Activity className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalDetections}</div>
                            <p className="text-muted-foreground text-xs">Seluruh riwayat deteksi</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardDescription>Deteksi Bulan Ini</CardDescription>
                            <TrendingUp className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.detectionsThisMonth}</div>
                            <p className="text-muted-foreground text-xs">Bulan berjalan</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardDescription>Rata-rata Akurasi</CardDescription>
                            <BarChart3 className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.averageConfidence.toFixed(1)}%</div>
                            <p className="text-muted-foreground text-xs">Tingkat kepercayaan model</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardDescription>Penyakit Terbanyak</CardDescription>
                            <Bug className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="truncate text-2xl font-bold">
                                {stats.mostDetectedDisease || '-'}
                            </div>
                            <p className="text-muted-foreground text-xs">Paling sering terdeteksi</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts & Quick Actions */}
                <div className="grid gap-4 lg:grid-cols-3">
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
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={diseaseDistribution} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" allowDecimals={false} />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                width={120}
                                                tick={{ fontSize: 12 }}
                                            />
                                            <Tooltip />
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
                            <Button asChild className="w-full justify-start">
                                <Link href="/detection">
                                    <ScanLine className="mr-2 h-4 w-4" />
                                    Deteksi Baru
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/expert-system">
                                    <BrainCircuit className="mr-2 h-4 w-4" />
                                    Sistem Pakar
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/diseases">
                                    <Bug className="mr-2 h-4 w-4" />
                                    Knowledge Base
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Detections Table */}
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
                                        {recentDetections.map((detection) => (
                                            <tr key={detection.id} className="border-b last:border-0">
                                                <td className="py-3 pr-4 whitespace-nowrap">
                                                    {formatDate(detection.created_at)}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    {detection.disease ? (
                                                        <Link
                                                            href={`/diseases/${detection.disease.slug}`}
                                                            className="text-primary hover:underline"
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
                                            </tr>
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
