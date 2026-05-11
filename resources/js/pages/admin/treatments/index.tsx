import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Filter, Pencil, Pill, Plus, Trash2, X } from 'lucide-react';
import {  useMemo, useState } from 'react';
import type {FormEvent} from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cssVars } from '@/lib/utils';
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
    primary: '#059669',
    secondary: '#10b981',
    muted: '#64748b',
    light: '#94a3b8',
    lightest: '#cbd5e1',
};

const TYPE_OPTIONS = [
    { value: 'prevention', label: 'Pencegahan' },
    { value: 'chemical', label: 'Kimiawi' },
    { value: 'biological', label: 'Biologis' },
    { value: 'cultural', label: 'Kultur Teknis' },
] as const;

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    prevention: { bg: palette.primary, text: '#ffffff' },
    chemical: { bg: '#dc2626', text: '#ffffff' },
    biological: { bg: palette.muted, text: '#ffffff' },
    cultural: { bg: palette.secondary, text: '#ffffff' },
};

const TYPE_LABELS: Record<string, string> = {
    prevention: 'Pencegahan',
    chemical: 'Kimiawi',
    biological: 'Biologis',
    cultural: 'Kultur Teknis',
};

interface Disease {
    id: number;
    name: string;
    slug: string;
}

interface Treatment {
    id: number;
    disease_id: number;
    type: string;
    description: string;
    dosage: string | null;
    dosage_unit: string | null;
    priority: number;
    disease: Disease;
}

interface Props {
    treatments: Treatment[];
    diseases: Disease[];
}

interface CreateFormData {
    disease_id: string;
    type: string;
    description: string;
    dosage: string;
    dosage_unit: string;
    priority: string;
}

interface EditFormData {
    disease_id: string;
    type: string;
    description: string;
    dosage: string;
    dosage_unit: string;
    priority: string;
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

const emptyCreate: CreateFormData = {
    disease_id: '',
    type: '',
    description: '',
    dosage: '',
    dosage_unit: '',
    priority: '1',
};

export default function TreatmentsIndex({ treatments, diseases }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);
    const [filterDisease, setFilterDisease] = useState<string>('all');

    // Create form state
    const [createData, setCreateData] = useState<CreateFormData>({ ...emptyCreate });

    // Edit form state
    const [editData, setEditData] = useState<EditFormData>({ ...emptyCreate });

    const filtered = useMemo(() => {
        if (filterDisease === 'all') {
return treatments;
}

        return treatments.filter((t) => String(t.disease_id) === filterDisease);
    }, [treatments, filterDisease]);

    function handleCreate(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post(
            '/admin/treatments',
            {
                disease_id: Number(createData.disease_id),
                type: createData.type,
                description: createData.description,
                dosage: createData.dosage || null,
                dosage_unit: createData.dosage_unit || null,
                priority: Number(createData.priority),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCreateData({ ...emptyCreate });
                    setShowForm(false);
                },
                onFinish: () => setProcessing(false),
            },
        );
    }

    function startEdit(treatment: Treatment) {
        setEditingId(treatment.id);
        setEditData({
            disease_id: String(treatment.disease_id),
            type: treatment.type,
            description: treatment.description,
            dosage: treatment.dosage ?? '',
            dosage_unit: treatment.dosage_unit ?? '',
            priority: String(treatment.priority),
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setEditData({ ...emptyCreate });
    }

    function handleUpdate(e: FormEvent, id: number) {
        e.preventDefault();
        setProcessing(true);
        router.put(
            `/admin/treatments/${id}`,
            {
                disease_id: Number(editData.disease_id),
                type: editData.type,
                description: editData.description,
                dosage: editData.dosage || null,
                dosage_unit: editData.dosage_unit || null,
                priority: Number(editData.priority),
            },
            {
                preserveScroll: true,
                onSuccess: () => cancelEdit(),
                onFinish: () => setProcessing(false),
            },
        );
    }

    function handleDelete(id: number, description: string) {
        if (!confirm(`Apakah Anda yakin ingin menghapus penanganan "${description}"?`)) {
return;
}

        router.delete(`/admin/treatments/${id}`, { preserveScroll: true });
    }

    function getTypeBadge(type: string) {
        const colors = TYPE_COLORS[type] ?? { bg: palette.lightest, text: '#333' };

        return (
            <Badge
                className="text-xs"
                style={{ backgroundColor: colors.bg, color: colors.text }}
            >
                {TYPE_LABELS[type] ?? type}
            </Badge>
        );
    }

    return (
        <>
            <Head title="Kelola Penanganan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Kelola Penanganan</h1>
                        <p className="text-sm text-muted-foreground">
                            Tambah, edit, dan hapus data penanganan penyakit padi
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Disease Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="size-4" style={{ color: palette.secondary }} />
                            <Select value={filterDisease} onValueChange={setFilterDisease}>
                                <SelectTrigger className="w-48" style={{ borderColor: palette.light }}>
                                    <SelectValue placeholder="Filter penyakit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Penyakit</SelectItem>
                                    {diseases.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                    Tambah Penanganan
                                </>
                            )}
                        </Button>
                    </div>
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
                                        <Pill className="size-5" />
                                        Tambah Penanganan Baru
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label>Penyakit</Label>
                                            <Select
                                                value={createData.disease_id}
                                                onValueChange={(v) =>
                                                    setCreateData({ ...createData, disease_id: v })
                                                }
                                                required
                                            >
                                                <SelectTrigger
                                                    className="w-full"
                                                    style={{ borderColor: palette.light }}
                                                >
                                                    <SelectValue placeholder="Pilih penyakit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {diseases.map((d) => (
                                                        <SelectItem key={d.id} value={String(d.id)}>
                                                            {d.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tipe</Label>
                                            <Select
                                                value={createData.type}
                                                onValueChange={(v) =>
                                                    setCreateData({ ...createData, type: v })
                                                }
                                                required
                                            >
                                                <SelectTrigger
                                                    className="w-full"
                                                    style={{ borderColor: palette.light }}
                                                >
                                                    <SelectValue placeholder="Pilih tipe" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TYPE_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                            <Label htmlFor="create-desc">Deskripsi</Label>
                                            <Input
                                                id="create-desc"
                                                placeholder="Deskripsi penanganan"
                                                value={createData.description}
                                                onChange={(e) =>
                                                    setCreateData({ ...createData, description: e.target.value })
                                                }
                                                required
                                                style={{
                                    borderColor: palette.light,
                                    ...cssVars({ '--tw-ring-color': palette.secondary }),
                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="create-dosage">Dosis</Label>
                                            <Input
                                                id="create-dosage"
                                                placeholder="Contoh: 2-3"
                                                value={createData.dosage}
                                                onChange={(e) =>
                                                    setCreateData({ ...createData, dosage: e.target.value })
                                                }
                                                style={{
                                    borderColor: palette.light,
                                    ...cssVars({ '--tw-ring-color': palette.secondary }),
                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="create-unit">Satuan Dosis</Label>
                                            <Input
                                                id="create-unit"
                                                placeholder="Contoh: ml/liter"
                                                value={createData.dosage_unit}
                                                onChange={(e) =>
                                                    setCreateData({ ...createData, dosage_unit: e.target.value })
                                                }
                                                style={{
                                    borderColor: palette.light,
                                    ...cssVars({ '--tw-ring-color': palette.secondary }),
                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="create-priority">Prioritas</Label>
                                            <Input
                                                id="create-priority"
                                                type="number"
                                                min={1}
                                                placeholder="1"
                                                value={createData.priority}
                                                onChange={(e) =>
                                                    setCreateData({ ...createData, priority: e.target.value })
                                                }
                                                required
                                                style={{
                                    borderColor: palette.light,
                                    ...cssVars({ '--tw-ring-color': palette.secondary }),
                                }}
                                            />
                                        </div>
                                        <div className="flex items-end sm:col-span-2 lg:col-span-3">
                                            <Button
                                                type="submit"
                                                disabled={processing || !createData.disease_id || !createData.type}
                                                className="w-full text-white sm:w-auto"
                                                style={{ backgroundColor: palette.primary }}
                                            >
                                                <Plus className="size-4" />
                                                Simpan Penanganan
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
                            {filtered.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead style={{ color: palette.primary }}>Penyakit</TableHead>
                                            <TableHead style={{ color: palette.primary }}>Tipe</TableHead>
                                            <TableHead style={{ color: palette.primary }}>Deskripsi</TableHead>
                                            <TableHead style={{ color: palette.primary }}>Dosis</TableHead>
                                            <TableHead style={{ color: palette.primary }}>Prioritas</TableHead>
                                            <TableHead style={{ color: palette.primary }} className="text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence mode="popLayout">
                                            {filtered.map((treatment, i) => (
                                                <motion.tr
                                                    key={treatment.id}
                                                    custom={i}
                                                    variants={rowVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    layout
                                                    className="border-b transition-colors hover:bg-muted/50"
                                                >
                                                    {editingId === treatment.id ? (
                                                        <>
                                                            <TableCell>
                                                                <Select
                                                                    value={editData.disease_id}
                                                                    onValueChange={(v) =>
                                                                        setEditData({ ...editData, disease_id: v })
                                                                    }
                                                                >
                                                                    <SelectTrigger
                                                                        className="h-8 w-36"
                                                                        style={{ borderColor: palette.secondary }}
                                                                    >
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {diseases.map((d) => (
                                                                            <SelectItem
                                                                                key={d.id}
                                                                                value={String(d.id)}
                                                                            >
                                                                                {d.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Select
                                                                    value={editData.type}
                                                                    onValueChange={(v) =>
                                                                        setEditData({ ...editData, type: v })
                                                                    }
                                                                >
                                                                    <SelectTrigger
                                                                        className="h-8 w-32"
                                                                        style={{ borderColor: palette.secondary }}
                                                                    >
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {TYPE_OPTIONS.map((opt) => (
                                                                            <SelectItem
                                                                                key={opt.value}
                                                                                value={opt.value}
                                                                            >
                                                                                {opt.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
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
                                                                    className="h-8 min-w-[160px]"
                                                                    style={{
                                                                        borderColor: palette.secondary,
                                                                        ...cssVars({ '--tw-ring-color': palette.secondary }),
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Input
                                                                        value={editData.dosage}
                                                                        onChange={(e) =>
                                                                            setEditData({
                                                                                ...editData,
                                                                                dosage: e.target.value,
                                                                            })
                                                                        }
                                                                        placeholder="Dosis"
                                                                        className="h-8 w-16"
                                                                        style={{
                                                                            borderColor: palette.secondary,
                                                                            ...cssVars({ '--tw-ring-color': palette.secondary }),
                                                                        }}
                                                                    />
                                                                    <Input
                                                                        value={editData.dosage_unit}
                                                                        onChange={(e) =>
                                                                            setEditData({
                                                                                ...editData,
                                                                                dosage_unit: e.target.value,
                                                                            })
                                                                        }
                                                                        placeholder="Satuan"
                                                                        className="h-8 w-20"
                                                                        style={{
                                                                            borderColor: palette.secondary,
                                                                            ...cssVars({ '--tw-ring-color': palette.secondary }),
                                                                        }}
                                                                    />
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    min={1}
                                                                    value={editData.priority}
                                                                    onChange={(e) =>
                                                                        setEditData({
                                                                            ...editData,
                                                                            priority: e.target.value,
                                                                        })
                                                                    }
                                                                    className="h-8 w-16"
                                                                    style={{
                                                                        borderColor: palette.secondary,
                                                                        ...cssVars({ '--tw-ring-color': palette.secondary }),
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        disabled={processing}
                                                                        onClick={(e) =>
                                                                            handleUpdate(e, treatment.id)
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
                                                            <TableCell className="font-medium">
                                                                {treatment.disease.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                {getTypeBadge(treatment.type)}
                                                            </TableCell>
                                                            <TableCell className="max-w-xs truncate text-muted-foreground">
                                                                {treatment.description}
                                                            </TableCell>
                                                            <TableCell>
                                                                {treatment.dosage ? (
                                                                    <span className="text-sm">
                                                                        {treatment.dosage}
                                                                        {treatment.dosage_unit && (
                                                                            <span className="ml-1 text-muted-foreground">
                                                                                {treatment.dosage_unit}
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted-foreground">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    style={{
                                                                        borderColor: palette.light,
                                                                        color: palette.primary,
                                                                    }}
                                                                >
                                                                    #{treatment.priority}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        onClick={() => startEdit(treatment)}
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
                                                                                treatment.id,
                                                                                treatment.description,
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
                                    <Pill className="size-10" style={{ color: `${palette.secondary}80` }} />
                                    <p className="text-sm text-muted-foreground">
                                        {filterDisease !== 'all'
                                            ? 'Tidak ada penanganan untuk penyakit yang dipilih.'
                                            : 'Belum ada data penanganan. Klik "Tambah Penanganan" untuk memulai.'}
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

TreatmentsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '/admin/diseases' },
        { title: 'Kelola Penanganan', href: '/admin/treatments' },
    ],
};
