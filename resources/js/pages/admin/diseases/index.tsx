import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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

interface Disease {
    id: number;
    name: string;
    slug: string;
    latin_name: string | null;
    description: string;
    cause: string;
    symptoms_count: number;
    treatments_count: number;
    detections_count: number;
}

interface Props {
    diseases: Disease[];
}

const rowVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.35, ease: 'easeOut' },
    },
};

export default function AdminDiseasesIndex({ diseases }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<Disease | null>(null);
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        if (!deleteTarget) {
return;
}

        setDeleting(true);
        router.delete(`/admin/diseases/${deleteTarget.id}`, {
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    }

    return (
        <>
            <Head title="Kelola Penyakit" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Kelola Penyakit
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola data penyakit pada tanaman padi
                        </p>
                    </div>
                    <Button
                        asChild
                        className="text-white"
                        style={{ backgroundColor: palette.deep }}
                    >
                        <Link href="/admin/diseases/create">
                            <Plus className="size-4" />
                            Tambah Penyakit
                        </Link>
                    </Button>
                </motion.div>

                {/* Table */}
                <AnimatePresence mode="wait">
                    {diseases.length > 0 ? (
                        <motion.div
                            key="table"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base" style={{ color: palette.deep }}>
                                        Daftar Penyakit
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>Nama Latin</TableHead>
                                                <TableHead className="text-center">Gejala</TableHead>
                                                <TableHead className="text-center">Penanganan</TableHead>
                                                <TableHead className="text-center">Deteksi</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <AnimatePresence>
                                                {diseases.map((disease, idx) => (
                                                    <motion.tr
                                                        key={disease.id}
                                                        variants={rowVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit={{ opacity: 0, x: 16 }}
                                                        transition={{
                                                            duration: 0.35,
                                                            delay: idx * 0.06,
                                                            ease: 'easeOut',
                                                        }}
                                                        className="border-b transition-colors last:border-0 hover:bg-muted/50"
                                                    >
                                                        <TableCell className="font-medium">
                                                            {disease.name}
                                                        </TableCell>
                                                        <TableCell className="italic text-muted-foreground">
                                                            {disease.latin_name || '-'}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge
                                                                variant="outline"
                                                                style={{
                                                                    borderColor: palette.sage,
                                                                    color: palette.deep,
                                                                }}
                                                            >
                                                                {disease.symptoms_count}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge
                                                                variant="outline"
                                                                style={{
                                                                    borderColor: palette.leaf,
                                                                    color: palette.deep,
                                                                }}
                                                            >
                                                                {disease.treatments_count}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-white"
                                                                style={{ backgroundColor: palette.teal }}
                                                            >
                                                                {disease.detections_count}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    asChild
                                                                >
                                                                    <Link href={`/admin/diseases/${disease.id}/edit`}>
                                                                        <Pencil
                                                                            className="size-4"
                                                                            style={{ color: palette.teal }}
                                                                        />
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setDeleteTarget(disease)}
                                                                >
                                                                    <Trash2 className="size-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16"
                            style={{ borderColor: palette.sand }}
                        >
                            <BookOpen className="size-10" style={{ color: `${palette.teal}80` }} />
                            <p className="text-sm text-muted-foreground">
                                Belum ada data penyakit
                            </p>
                            <Button
                                asChild
                                size="sm"
                                className="mt-2 text-white"
                                style={{ backgroundColor: palette.deep }}
                            >
                                <Link href="/admin/diseases/create">
                                    <Plus className="size-4" />
                                    Tambah Penyakit Pertama
                                </Link>
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Penyakit</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus penyakit{' '}
                            <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak dapat
                            dibatalkan.
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

AdminDiseasesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: '/admin/diseases',
        },
        {
            title: 'Kelola Penyakit',
            href: '/admin/diseases',
        },
    ],
};
