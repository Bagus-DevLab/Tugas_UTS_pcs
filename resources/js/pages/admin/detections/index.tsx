import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Eye, Trash2, ChevronLeft, ChevronRight, Inbox, ShieldCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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

const palette = {
    sand: '#DDD8C4',
    sage: '#A3C9A8',
    leaf: '#84B59F',
    teal: '#69A297',
    deep: '#50808E',
};

interface Detection {
    id: number;
    method: string;
    label: string | null;
    confidence: number | null;
    created_at: string;
    connection_status: string;
    user?: { id: number; name: string; email: string } | null;
    disease?: { id: number; name: string; slug: string } | null;
}

interface Props {
    detections: {
        data: Detection[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { method?: string; user_search?: string };
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatConfidence(confidence: number | null): string {
    if (confidence === null) {
return '-';
}

    return `${Number(confidence).toFixed(1)}%`;
}

function getMethodLabel(method: string): string {
    return method === 'image' ? 'Image' : 'Expert System';
}

const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
    },
};

const filterBarVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 400, damping: 30, staggerChildren: 0.06 },
    },
};

const filterItemVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 400, damping: 28 },
    },
};

export default function AdminDetectionsIndex({ detections, filters }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<Detection | null>(null);
    const [deleting, setDeleting] = useState(false);

    function handleFilterChange(key: string, value: string) {
        const params: Record<string, string> = {
            ...(filters.method && { method: filters.method }),
            ...(filters.user_search && { user_search: filters.user_search }),
        };

        if (value && value !== 'all') {
            params[key] = value;
        } else {
            delete params[key];
        }

        router.get('/admin/detections', params, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function handleSearchChange(value: string) {
        const params: Record<string, string> = {
            ...(filters.method && { method: filters.method }),
        };

        if (value.trim()) {
            params.user_search = value;
        }

        router.get('/admin/detections', params, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function handleReset() {
        router.get('/admin/detections', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function handleDelete() {
        if (!deleteTarget) {
return;
}

        setDeleting(true);
        router.delete(`/admin/detections/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    }

    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    function handleSearchInput(value: string) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => handleSearchChange(value), 400);
    }

    return (
        <>
            <Head title="Semua Deteksi - Admin" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col gap-1"
                >
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="size-5" style={{ color: palette.deep }} />
                        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: palette.deep }}>
                            Semua Deteksi
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Kelola seluruh data deteksi penyakit padi dari semua pengguna.
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
                        <label className="text-xs font-medium text-muted-foreground">Cari User</label>
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
                                style={{ color: palette.teal }}
                            />
                            <Input
                                placeholder="Nama atau email..."
                                defaultValue={filters.user_search || ''}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                className="w-[220px] pl-9"
                                style={{ borderColor: palette.sage }}
                            />
                        </div>
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
                            style={{ borderColor: palette.sand }}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.35 }}
                        >
                            <Table>
                                <TableHeader>
                                    <TableRow style={{ backgroundColor: `${palette.sand}33` }}>
                                        <TableHead style={{ color: palette.deep }}>User</TableHead>
                                        <TableHead style={{ color: palette.deep }}>Email</TableHead>
                                        <TableHead style={{ color: palette.deep }}>Label</TableHead>
                                        <TableHead style={{ color: palette.deep }}>Akurasi</TableHead>
                                        <TableHead style={{ color: palette.deep }}>Metode</TableHead>
                                        <TableHead style={{ color: palette.deep }}>Tanggal</TableHead>
                                        <TableHead style={{ color: palette.deep }}>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {detections.data.map((detection, index) => (
                                            <motion.tr
                                                key={detection.id}
                                                className="border-b transition-colors last:border-b-0"
                                                variants={rowVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.04 }}
                                                whileHover={{
                                                    backgroundColor: `${palette.sage}18`,
                                                    transition: { duration: 0.15 },
                                                }}
                                            >
                                                <TableCell className="font-medium">
                                                    {detection.user?.name || (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {detection.user?.email || '-'}
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
                                                            backgroundColor:
                                                                detection.method === 'image'
                                                                    ? palette.teal
                                                                    : palette.leaf,
                                                        }}
                                                    >
                                                        {getMethodLabel(detection.method)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(detection.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/detections/${detection.id}`}>
                                                                <Eye className="size-4" style={{ color: palette.teal }} />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 hover:text-red-600"
                                                            onClick={() => setDeleteTarget(detection)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </motion.div>
                    ) : (
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
                                Tidak Ada Data Deteksi
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Belum ada data deteksi yang sesuai dengan filter.
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
                            Total {detections.total} data
                        </p>
                        <div className="flex items-center gap-1">
                            {detections.links.map((link, index) => {
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
                                            <Link href={link.url} preserveState preserveScroll>
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Deteksi</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus data deteksi #{deleteTarget?.id}
                            {deleteTarget?.user?.name ? ` milik ${deleteTarget.user.name}` : ''}?
                            Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                            disabled={deleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminDetectionsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: '/admin/diseases',
        },
        {
            title: 'Semua Deteksi',
            href: '/admin/detections',
        },
    ],
};
