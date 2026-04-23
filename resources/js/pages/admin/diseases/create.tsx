import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const palette = {
    sand: '#DDD8C4',
    sage: '#A3C9A8',
    leaf: '#84B59F',
    teal: '#69A297',
    deep: '#50808E',
};

interface Symptom {
    id: number;
    code: string;
    name: string;
}

interface Props {
    symptoms: Symptom[];
}

interface FormData {
    name: string;
    latin_name: string;
    description: string;
    cause: string;
    symptoms: Record<number, number>;
}

const sectionVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut', delay: i * 0.12 },
    }),
};

export default function AdminDiseasesCreate({ symptoms }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        latin_name: '',
        description: '',
        cause: '',
        symptoms: {},
    });

    function toggleSymptom(symptomId: number, checked: boolean) {
        const updated = { ...data.symptoms };

        if (checked) {
            updated[symptomId] = 0.5;
        } else {
            delete updated[symptomId];
        }

        setData('symptoms', updated);
    }

    function updateWeight(symptomId: number, weight: number) {
        setData('symptoms', {
            ...data.symptoms,
            [symptomId]: weight,
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/diseases');
    }

    return (
        <>
            <Head title="Tambah Penyakit" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Back button */}
                <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/diseases">
                            <ArrowLeft className="size-4" />
                            Kembali ke Daftar Penyakit
                        </Link>
                    </Button>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                    <h1 className="text-xl font-semibold tracking-tight">
                        Tambah Penyakit Baru
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Isi data penyakit dan pilih gejala yang terkait
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Basic Info */}
                    <motion.div
                        custom={0}
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Card
                            className="border-t-4"
                            style={{ borderTopColor: palette.sage }}
                        >
                            <CardHeader>
                                <CardTitle className="text-base" style={{ color: palette.deep }}>
                                    Informasi Dasar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Nama Penyakit <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Contoh: Blast"
                                            style={{
                                                borderColor: errors.name ? undefined : palette.sage,
                                            }}
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="latin_name">Nama Latin</Label>
                                        <Input
                                            id="latin_name"
                                            value={data.latin_name}
                                            onChange={(e) => setData('latin_name', e.target.value)}
                                            placeholder="Contoh: Pyricularia oryzae"
                                            style={{
                                                borderColor: errors.latin_name ? undefined : palette.sage,
                                            }}
                                        />
                                        <InputError message={errors.latin_name} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Deskripsi <span className="text-destructive">*</span>
                                    </Label>
                                    <textarea
                                        id="description"
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Deskripsi lengkap mengenai penyakit..."
                                        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                                        style={{
                                            borderColor: errors.description ? undefined : palette.sage,
                                        }}
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cause">
                                        Penyebab <span className="text-destructive">*</span>
                                    </Label>
                                    <textarea
                                        id="cause"
                                        rows={3}
                                        value={data.cause}
                                        onChange={(e) => setData('cause', e.target.value)}
                                        placeholder="Penyebab penyakit..."
                                        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                                        style={{
                                            borderColor: errors.cause ? undefined : palette.sage,
                                        }}
                                    />
                                    <InputError message={errors.cause} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Symptom Selection */}
                    <motion.div
                        custom={1}
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Card
                            className="border-t-4"
                            style={{ borderTopColor: palette.teal }}
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base" style={{ color: palette.deep }}>
                                        Gejala Terkait
                                    </CardTitle>
                                    <Badge
                                        variant="outline"
                                        style={{ borderColor: palette.teal, color: palette.deep }}
                                    >
                                        {Object.keys(data.symptoms).length} dipilih
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <InputError message={errors.symptoms} className="mb-4" />

                                {symptoms.length > 0 ? (
                                    <div className="space-y-3">
                                        {symptoms.map((symptom, idx) => {
                                            const isSelected = symptom.id in data.symptoms;
                                            const weight = data.symptoms[symptom.id] ?? 0.5;

                                            return (
                                                <motion.div
                                                    key={symptom.id}
                                                    initial={{ opacity: 0, x: -12 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: 0.2 + idx * 0.04,
                                                        ease: 'easeOut',
                                                    }}
                                                    className="rounded-lg border p-3 transition-colors"
                                                    style={{
                                                        borderColor: isSelected ? palette.teal : undefined,
                                                        backgroundColor: isSelected ? `${palette.teal}08` : undefined,
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Checkbox
                                                            id={`symptom-${symptom.id}`}
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) =>
                                                                toggleSymptom(symptom.id, !!checked)
                                                            }
                                                            className="mt-0.5"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <label
                                                                htmlFor={`symptom-${symptom.id}`}
                                                                className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                                                            >
                                                                <Badge
                                                                    variant="outline"
                                                                    style={{
                                                                        borderColor: palette.sage,
                                                                        color: palette.deep,
                                                                    }}
                                                                >
                                                                    {symptom.code}
                                                                </Badge>
                                                                {symptom.name}
                                                            </label>

                                                            {isSelected && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    transition={{ duration: 0.25 }}
                                                                    className="mt-3 flex items-center gap-3"
                                                                >
                                                                    <Label className="shrink-0 text-xs text-muted-foreground">
                                                                        Bobot:
                                                                    </Label>
                                                                    <input
                                                                        type="range"
                                                                        min={0}
                                                                        max={1}
                                                                        step={0.05}
                                                                        value={weight}
                                                                        onChange={(e) =>
                                                                            updateWeight(
                                                                                symptom.id,
                                                                                parseFloat(e.target.value),
                                                                            )
                                                                        }
                                                                        className="h-2 flex-1 cursor-pointer appearance-none rounded-full outline-none"
                                                                        style={{
                                                                            background: `linear-gradient(to right, ${palette.teal} 0%, ${palette.teal} ${weight * 100}%, ${palette.sand} ${weight * 100}%, ${palette.sand} 100%)`,
                                                                            accentColor: palette.teal,
                                                                        }}
                                                                    />
                                                                    <span
                                                                        className="min-w-[3.5rem] rounded-md px-2 py-1 text-center text-xs font-semibold text-white"
                                                                        style={{ backgroundColor: palette.deep }}
                                                                    >
                                                                        {(weight * 100).toFixed(0)}%
                                                                    </span>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        Belum ada data gejala tersedia
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                        custom={2}
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex items-center justify-end gap-3"
                    >
                        <Button variant="outline" asChild>
                            <Link href="/admin/diseases">Batal</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="text-white"
                            style={{ backgroundColor: palette.deep }}
                        >
                            <Save className="size-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Penyakit'}
                        </Button>
                    </motion.div>
                </form>
            </div>
        </>
    );
}

AdminDiseasesCreate.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: '/admin/diseases',
        },
        {
            title: 'Kelola Penyakit',
            href: '/admin/diseases',
        },
        {
            title: 'Tambah Penyakit',
            href: '/admin/diseases/create',
        },
    ],
};
