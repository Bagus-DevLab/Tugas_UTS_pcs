import { Head, Link, router } from '@inertiajs/react';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Detection {
    id: number;
    method: 'image' | 'expert_system';
    image_path: string | null;
    label: string | null;
    confidence: number | null;
    temperature: number | null;
    scanned_at: string | null;
    latitude: number | null;
    longitude: number | null;
    connection_status: string;
    created_at: string;
    disease?: { id: number; name: string; slug: string } | null;
}

interface Props {
    detections: {
        data: Detection[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        method?: string;
        date_from?: string;
        date_to?: string;
    };
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatConfidence(confidence: number | null): string {
    if (confidence === null) return '-';
    return `${(confidence * 100).toFixed(1)}%`;
}

function getMethodLabel(method: string): string {
    return method === 'image' ? 'Image' : 'Expert System';
}

function getMethodVariant(method: string): 'default' | 'secondary' {
    return method === 'image' ? 'default' : 'secondary';
}

function getStatusVariant(status: string): 'default' | 'destructive' | 'outline' {
    switch (status) {
        case 'online':
            return 'default';
        case 'offline':
            return 'destructive';
        default:
            return 'outline';
    }
}

export default function DetectionHistory({ detections, filters }: Props) {
    function handleFilterChange(key: string, value: string) {
        const params: Record<string, string> = {
            ...(filters.method && { method: filters.method }),
            ...(filters.date_from && { date_from: filters.date_from }),
            ...(filters.date_to && { date_to: filters.date_to }),
        };

        if (value && value !== 'all') {
            params[key] = value;
        } else {
            delete params[key];
        }

        router.get('/detection/history', params, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function handleReset() {
        router.get('/detection/history', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    const startIndex = (detections.current_page - 1) * detections.per_page;

    return (
        <>
            <Head title="Riwayat Deteksi" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Riwayat Deteksi</h1>
                    <p className="text-sm text-muted-foreground">
                        Daftar seluruh hasil deteksi penyakit padi yang telah dilakukan.
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Metode</label>
                        <Select
                            value={filters.method || 'all'}
                            onValueChange={(value) => handleFilterChange('method', value)}
                        >
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Semua Metode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Metode</SelectItem>
                                <SelectItem value="image">Image</SelectItem>
                                <SelectItem value="expert_system">Expert System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Dari Tanggal</label>
                        <Input
                            type="date"
                            className="w-[160px]"
                            value={filters.date_from || ''}
                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Sampai Tanggal</label>
                        <Input
                            type="date"
                            className="w-[160px]"
                            value={filters.date_to || ''}
                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                        />
                    </div>

                    <Button variant="outline" size="sm" onClick={handleReset}>
                        <Filter className="mr-1.5 size-3.5" />
                        Reset
                    </Button>
                </div>

                {/* Table */}
                {detections.data.length > 0 ? (
                    <div className="rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">No</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Label Penyakit</TableHead>
                                    <TableHead>Akurasi</TableHead>
                                    <TableHead>Metode</TableHead>
                                    <TableHead>Suhu</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {detections.data.map((detection, index) => (
                                    <TableRow
                                        key={detection.id}
                                        className="cursor-pointer"
                                        onClick={() => router.visit(`/detection/${detection.id}`)}
                                    >
                                        <TableCell className="text-muted-foreground">
                                            {startIndex + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(detection.scanned_at || detection.created_at)}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {detection.disease?.name || detection.label || (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {detection.confidence !== null ? (
                                                <span className="font-mono text-sm">
                                                    {formatConfidence(detection.confidence)}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getMethodVariant(detection.method)}>
                                                {getMethodLabel(detection.method)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {detection.temperature !== null ? (
                                                <span className="font-mono text-sm">
                                                    {detection.temperature.toFixed(1)}°C
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(detection.connection_status)}>
                                                {detection.connection_status === 'online' ? 'Online' : 'Offline'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16">
                        <Inbox className="mb-4 size-12 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium">Belum Ada Data Deteksi</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Hasil deteksi penyakit padi akan muncul di sini setelah Anda melakukan pemindaian.
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {detections.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {startIndex + 1}–{Math.min(startIndex + detections.per_page, detections.total)} dari {detections.total} data
                        </p>
                        <div className="flex items-center gap-1">
                            {detections.links.map((link, index) => {
                                // Skip prev/next text links, we use icons
                                if (index === 0) {
                                    return (
                                        <Button
                                            key="prev"
                                            variant="outline"
                                            size="icon"
                                            className="size-8"
                                            disabled={!link.url}
                                            asChild={!!link.url}
                                        >
                                            {link.url ? (
                                                <Link href={link.url} preserveState preserveScroll>
                                                    <ChevronLeft className="size-4" />
                                                </Link>
                                            ) : (
                                                <ChevronLeft className="size-4" />
                                            )}
                                        </Button>
                                    );
                                }

                                if (index === detections.links.length - 1) {
                                    return (
                                        <Button
                                            key="next"
                                            variant="outline"
                                            size="icon"
                                            className="size-8"
                                            disabled={!link.url}
                                            asChild={!!link.url}
                                        >
                                            {link.url ? (
                                                <Link href={link.url} preserveState preserveScroll>
                                                    <ChevronRight className="size-4" />
                                                </Link>
                                            ) : (
                                                <ChevronRight className="size-4" />
                                            )}
                                        </Button>
                                    );
                                }

                                return (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="icon"
                                        className="size-8"
                                        disabled={!link.url}
                                        asChild={!!link.url}
                                    >
                                        {link.url ? (
                                            <Link
                                                href={link.url}
                                                preserveState
                                                preserveScroll
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

DetectionHistory.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Riwayat Deteksi',
            href: '/detection/history',
        },
    ],
};
