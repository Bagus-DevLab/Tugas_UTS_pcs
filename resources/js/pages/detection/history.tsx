import { Head, Link, router } from '@inertiajs/react';
import { Filter, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Color palette
const palette = {
    sand: '#DDD8C4',
    sage: '#A3C9A8',
    leaf: '#84B59F',
    teal: '#69A297',
    deep: '#50808E',
};

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
    return `${Number(confidence).toFixed(1)}%`;
}

function getMethodLabel(method: string): string {
    return method === 'image' ? 'Image' : 'Expert System';
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04 },
    },
};

const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
};

const filterBarVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 400, damping: 30, staggerChildren: 0.06 },
    },
};

const filterItemVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 400, damping: 28 },
    },
};

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
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="text-2xl font-semibold tracking-tight" style={{ color: palette.deep }}>
                        Riwayat Deteksi
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Daftar seluruh hasil deteksi penyakit padi yang telah dilakukan.
                    </p>
                </motion.div>

                {/* Filter Bar */}
                <motion.div
                    className="flex flex-wrap items-end gap-3"
                    variants={filterBarVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="flex flex-col gap-1.5" variants={filterItemVariants}>
                        <label className="text-xs font-medium text-muted-foreground">Metode</label>
                        <Select
                            value={filters.method || 'all'}
                            onValueChange={(value) => handleFilterChange('method', value)}
                        >
                            <SelectTrigger className="w-[160px]" style={{ borderColor: palette.sage }}>
                                <SelectValue placeholder="Semua Metode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Metode</SelectItem>
                                <SelectItem value="image">Image</SelectItem>
                                <SelectItem value="expert_system">Expert System</SelectItem>
                            </SelectContent>
                        </Select>
                    </motion.div>

                    <motion.div className="flex flex-col gap-1.5" variants={filterItemVariants}>
                        <label className="text-xs font-medium text-muted-foreground">Dari Tanggal</label>
                        <Input
                            type="date"
                            className="w-[160px]"
                            style={{ borderColor: palette.sage }}
                            value={filters.date_from || ''}
                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                        />
                    </motion.div>

                    <motion.div className="flex flex-col gap-1.5" variants={filterItemVariants}>
                        <label className="text-xs font-medium text-muted-foreground">Sampai Tanggal</label>
                        <Input
                            type="date"
                            className="w-[160px]"
                            style={{ borderColor: palette.sage }}
                            value={filters.date_to || ''}
                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                        />
                    </motion.div>

                    <motion.div variants={filterItemVariants}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="transition-colors hover:text-white"
                            style={{ borderColor: palette.teal, color: palette.teal }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = palette.teal;
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                            }}
                        >
                            <Filter className="mr-1.5 size-3.5" />
                            Reset
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Table */}
                <AnimatePresence mode="wait">
                    {detections.data.length > 0 ? (
                        <motion.div
                            key="table"
                            className="overflow-hidden rounded-xl border"
                            style={{ borderColor: `${palette.sand}` }}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.35 }}
                        >
                            <Table>
                                <TableHeader>
                                    <TableRow style={{ backgroundColor: `${palette.sand}33` }}>
                                        <TableHead className="w-[50px]" style={{ color: palette.deep }}>No</TableHead>
                                        <TableHead style={{ color: palette.deep }}>Tanggal</TableHead>
                                        <TableHead style={{ color: palette.deep }}>Label Penyakit</TableHead>
                                        <TableHead style={{ color: palette.deep }}>Akurasi</TableHead>
                                        <TableHead style={{ color: palette.deep }}>Metode</TableHead>
                                        <TableHead style={{ color: palette.deep }}>Suhu</TableHead>
                                        <TableHead style={{ color: palette.deep }}>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {detections.data.map((detection, index) => (
                                            <motion.tr
                                                key={detection.id}
                                                className="cursor-pointer border-b transition-colors last:border-b-0 hover:bg-muted/50"
                                                style={{ ['--hover-accent' as string]: `${palette.sage}22` }}
                                                variants={rowVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit={{ opacity: 0, x: 20 }}
                                                custom={index}
                                                transition={{ delay: index * 0.04 }}
                                                onClick={() => router.visit(`/detection/${detection.id}`)}
                                                whileHover={{
                                                    backgroundColor: `${palette.sage}18`,
                                                    transition: { duration: 0.15 },
                                                }}
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
                                                        <span className="font-mono text-sm" style={{ color: palette.deep }}>
                                                            {formatConfidence(detection.confidence)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className="text-white"
                                                        style={{
                                                            backgroundColor: detection.method === 'image' ? palette.teal : palette.leaf,
                                                        }}
                                                    >
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
                                                    <Badge
                                                        className="text-white"
                                                        style={{
                                                            backgroundColor:
                                                                detection.connection_status === 'online'
                                                                    ? palette.sage
                                                                    : '#b45555',
                                                        }}
                                                    >
                                                        <span
                                                            className="mr-1.5 inline-block size-2 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    detection.connection_status === 'online'
                                                                        ? '#d4edda'
                                                                        : '#f5c6cb',
                                                            }}
                                                        />
                                                        {detection.connection_status === 'online' ? 'Online' : 'Offline'}
                                                    </Badge>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </motion.div>
                    ) : (
                        /* Empty State */
                        <motion.div
                            key="empty"
                            className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16"
                            style={{ borderColor: palette.sand }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Inbox className="mb-4 size-12" style={{ color: `${palette.teal}66` }} />
                            <h3 className="text-lg font-medium" style={{ color: palette.deep }}>
                                Belum Ada Data Deteksi
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Hasil deteksi penyakit padi akan muncul di sini setelah Anda melakukan pemindaian.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {detections.last_page > 1 && (
                    <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    >
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
                                            style={{ borderColor: palette.sage }}
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
                                            style={{ borderColor: palette.sage }}
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
                                        className="size-8 text-white"
                                        style={
                                            link.active
                                                ? { backgroundColor: palette.deep, borderColor: palette.deep }
                                                : { borderColor: palette.sage }
                                        }
                                        disabled={!link.url}
                                        asChild={!!link.url}
                                    >
                                        {link.url ? (
                                            <Link
                                                href={link.url}
                                                preserveState
                                                preserveScroll
                                            >
                                                {link.label.replace(/&laquo;/g, '\u00AB').replace(/&raquo;/g, '\u00BB')}
                                            </Link>
                                        ) : (
                                            <span>{link.label.replace(/&laquo;/g, '\u00AB').replace(/&raquo;/g, '\u00BB')}</span>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </motion.div>
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
