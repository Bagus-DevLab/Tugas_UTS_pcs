import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Pencil, Plus, Stethoscope, Trash2, X } from 'lucide-react';
import {  useState } from 'react';
import type {FormEvent} from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const palette = {
    primary: '#059669',
    secondary: '#10b981',
    muted: '#64748b',
    light: '#94a3b8',
    lightest: '#cbd5e1',
};

interface Symptom {
    id: number;
    code: string;
    name: string;
    description: string | null;
    diseases_count: number;
}

interface Props {
    symptoms: Symptom[];
}

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const rowVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { duration: 0.3, delay: 0.04 * i, ease: 'easeOut' as const },
    }),
    exit: { opacity: 0, x: 12, transition: { duration: 0.2 } },
};

export default function SymptomsIndex({ symptoms }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    // Create form state
    const [createData, setCreateData] = useState({ code: '', name: '', description: '' });

    // Edit form state
    const [editData, setEditData] = useState({ code: '', name: '', description: '' });

    function handleCreate(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/admin/symptoms', createData, {
            preserveScroll: true,
            onSuccess: () => {
                setCreateData({ code: '', name: '', description: '' });
                setShowForm(false);
            },
            onFinish: () => setProcessing(false),
        });
    }

    function startEdit(symptom: Symptom) {
        setEditingId(symptom.id);
        setEditData({
            code: symptom.code,
            name: symptom.name,
            description: symptom.description ?? '',
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setEditData({ code: '', name: '', description: '' });
    }

    function handleUpdate(e: FormEvent, id: number) {
        e.preventDefault();
        setProcessing(true);
        router.put(`/admin/symptoms/${id}`, editData, {
            preserveScroll: true,
            onSuccess: () => cancelEdit(),
            onFinish: () => setProcessing(false),
        });
    }

    function handleDelete(id: number, name: string) {
        if (!confirm(`Apakah Anda yakin ingin menghapus gejala "${name}"?`)) {
return;
}

        router.delete(`/admin/symptoms/${id}`, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Kelola Gejala" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Kelola Gejala</h1>
                        <p className="text-sm text-muted-foreground">
                            Tambah, edit, dan hapus data gejala penyakit padi
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="text-white"
                        style={{ backgroundColor: showForm ? palette.secondary : palette.primary }}
                    >
                        {showForm ? (
                            <>
                                <X className="size-4" />
                                Batal
                            </>
                        ) : (
                            <>
                                <Plus className="size-4" />
                                Tambah Gejala
                            </>
                        )}
                    </Button>
                </motion.div>

                {/* Create Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <Card
                                className="border-2"
                                style={{ borderColor: `${palette.light}80` }}
                            >
                                <CardHeader>
                                    <CardTitle
                                        className="flex items-center gap-2 text-base"
                                        style={{ color: palette.primary }}
                                    >
                                        <Stethoscope className="size-5" />
                                        Tambah Gejala Baru
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="create-code">Kode</Label>
                                            <Input
                                                id="create-code"
                                                placeholder="G001"
                                                value={createData.code}
                                                onChange={(e) =>
                                                    setCreateData({ ...createData, code: e.target.value })
                                                }
                                                required
                                                style={{
                                                    borderColor: palette.light,
                                                    // @ts-expect-error CSS custom property
                                                    '--tw-ring-color': palette.secondary,
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="create-name">Nama</Label>
                                            <Input
                                                id="create-name"
                                                placeholder="Nama gejala"
                                                value={createData.name}
                                                onChange={(e) =>
                                                    setCreateData({ ...createData, name: e.target.value })
                                                }
                                                required
                                                style={{
                                                    borderColor: palette.light,
                                                    // @ts-expect-error CSS custom property
                                                    '--tw-ring-color': palette.secondary,
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="create-desc">Deskripsi</Label>
                                            <Input
                                                id="create-desc"
                                                placeholder="Deskripsi gejala (opsional)"
                                                value={createData.description}
                                                onChange={(e) =>
                                                    setCreateData({ ...createData, description: e.target.value })
                                                }
                                                style={{
                                                    borderColor: palette.light,
                                                    // @ts-expect-error CSS custom property
                                                    '--tw-ring-color': palette.secondary,
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full text-white"
                                                style={{ backgroundColor: palette.primary }}
                                            >
                                                <Plus className="size-4" />
                                                Simpan
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table */}
                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                    <Card>
                        <CardContent className="p-0">
                            {symptoms.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead style={{ color: palette.primary }}>Kode</TableHead>
                                            <TableHead style={{ color: palette.primary }}>Nama</TableHead>
                                            <TableHead style={{ color: palette.primary }}>Deskripsi</TableHead>
                                            <TableHead style={{ color: palette.primary }}>
                                                Penyakit Terkait
                                            </TableHead>
                                            <TableHead style={{ color: palette.primary }} className="text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence mode="popLayout">
                                            {symptoms.map((symptom, i) => (
                                                <motion.tr
                                                    key={symptom.id}
                                                    custom={i}
                                                    variants={rowVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    layout
                                                    className="border-b transition-colors hover:bg-muted/50"
                                                >
                                                    {editingId === symptom.id ? (
                                                        <>
                                                            <TableCell>
                                                                <Input
                                                                    value={editData.code}
                                                                    onChange={(e) =>
                                                                        setEditData({
                                                                            ...editData,
                                                                            code: e.target.value,
                                                                        })
                                                                    }
                                                                    className="h-8 w-20"
                                                                    style={{
                                                                        borderColor: palette.secondary,
                                                                        // @ts-expect-error CSS custom property
                                                                        '--tw-ring-color': palette.secondary,
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    value={editData.name}
                                                                    onChange={(e) =>
                                                                        setEditData({
                                                                            ...editData,
                                                                            name: e.target.value,
                                                                        })
                                                                    }
                                                                    className="h-8"
                                                                    style={{
                                                                        borderColor: palette.secondary,
                                                                        // @ts-expect-error CSS custom property
                                                                        '--tw-ring-color': palette.secondary,
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    value={editData.description}
                                                                    onChange={(e) =>
                                                                        setEditData({
                                                                            ...editData,
                                                                            description: e.target.value,
                                                                        })
                                                                    }
                                                                    className="h-8"
                                                                    style={{
                                                                        borderColor: palette.secondary,
                                                                        // @ts-expect-error CSS custom property
                                                                        '--tw-ring-color': palette.secondary,
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="text-white"
                                                                    style={{ backgroundColor: palette.secondary }}
                                                                >
                                                                    {symptom.diseases_count}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        disabled={processing}
                                                                        onClick={(e) =>
                                                                            handleUpdate(e, symptom.id)
                                                                        }
                                                                        className="size-8"
                                                                        style={{ color: palette.muted }}
                                                                    >
                                                                        <Check className="size-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        onClick={cancelEdit}
                                                                        className="size-8 text-muted-foreground"
                                                                    >
                                                                        <X className="size-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    style={{
                                                                        borderColor: palette.light,
                                                                        color: palette.primary,
                                                                    }}
                                                                >
                                                                    {symptom.code}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {symptom.name}
                                                            </TableCell>
                                                            <TableCell className="max-w-xs truncate text-muted-foreground">
                                                                {symptom.description || '-'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="text-white"
                                                                    style={{ backgroundColor: palette.secondary }}
                                                                >
                                                                    {symptom.diseases_count} penyakit
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        onClick={() => startEdit(symptom)}
                                                                        className="size-8"
                                                                        style={{ color: palette.secondary }}
                                                                    >
                                                                        <Pencil className="size-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                symptom.id,
                                                                                symptom.name,
                                                                            )
                                                                        }
                                                                        className="size-8 text-destructive hover:text-destructive"
                                                                    >
                                                                        <Trash2 className="size-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </>
                                                    )}
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            ) : (
                                <div
                                    className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16"
                                    style={{ borderColor: palette.lightest }}
                                >
                                    <Stethoscope
                                        className="size-10"
                                        style={{ color: `${palette.secondary}80` }}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada data gejala. Klik &quot;Tambah Gejala&quot; untuk memulai.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    );
}

SymptomsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '/admin/diseases' },
        { title: 'Kelola Gejala', href: '/admin/symptoms' },
    ],
};
