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
    primary: '#059669',
    secondary: '#10b981',
    muted: '#64748b',
    light: '#94a3b8',
    lightest: '#cbd5e1',
};

interface SymptomPivot {
    id: number;
    code: string;
    name: string;
    pivot: { weight: number };
}

interface Treatment {
    id: number;
    type: string;
    description: string;
    dosage: string | null;
    dosage_unit: string | null;
}

interface Disease {
    id: number;
    name: string;
    slug: string;
    latin_name: string | null;
    description: string;
    cause: string;
    symptoms: SymptomPivot[];
    treatments: Treatment[];
}

interface Symptom {
    id: number;
    code: string;
    name: string;
}

interface Props {
    disease: Disease;
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

function buildInitialSymptoms(diseaseSymptoms: SymptomPivot[]): Record<number, number> {
    const map: Record<number, number> = {};

    for (const s of diseaseSymptoms) {
        map[s.id] = s.pivot.weight;
    }

    return map;
}

export default function AdminDiseasesEdit({ disease, symptoms }: Props) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: disease.name,
        latin_name: disease.latin_name ?? '',
        description: disease.description,
        cause: disease.cause,
        symptoms: buildInitialSymptoms(disease.symptoms),
    });

    function toggleSymptom(symptomId: number, checked: boolean) {
        const updated = { ...data.symptoms };

        if (checked) {
            // Restore previous weight if it existed, otherwise default to 0.5
            const existing = disease.symptoms.find((s) => s.id === symptomId);
            updated[symptomId] = existing?.pivot.weight ?? 0.5;
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
        put(`/admin/diseases/${disease.id}`);
    }

    const treatmentTypeLabels: Record<string, string> = {
        prevention: 'Pencegahan',
        chemical: 'Kimiawi',
        biological: 'Biologis',
        cultural: 'Kultur Teknis',
    };

    return (
        <>
            <Head title={`Edit: ${disease.name}`} />

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
                        Edit Penyakit
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Perbarui data penyakit <strong>{disease.name}</strong>
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
                            style={{ borderTopColor: palette.light }}
                        >
                            <CardHeader>
                                <CardTitle className="text-base" style={{ color: palette.primary }}>
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
                                                borderColor: errors.name ? undefined : palette.light,
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
                                                borderColor: errors.latin_name ? undefined : palette.light,
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
                                            borderColor: errors.description ? undefined : palette.light,
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
                                            borderColor: errors.cause ? undefined : palette.light,
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
                            style={{ borderTopColor: palette.secondary }}
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base" style={{ color: palette.primary }}>
                                        Gejala Terkait
                                    </CardTitle>
                                    <Badge
                                        variant="outline"
                                        style={{ borderColor: palette.secondary, color: palette.primary }}
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
                                                        borderColor: isSelected ? palette.secondary : undefined,
                                                        backgroundColor: isSelected ? `${palette.secondary}08` : undefined,
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
                                                                        borderColor: palette.light,
                                                                        color: palette.primary,
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
                                                                            background: `linear-gradient(to right, ${palette.secondary} 0%, ${palette.secondary} ${weight * 100}%, ${palette.lightest} ${weight * 100}%, ${palette.lightest} 100%)`,
                                                                            accentColor: palette.secondary,
                                                                        }}
                                                                    />
                                                                    <span
                                                                        className="min-w-[3.5rem] rounded-md px-2 py-1 text-center text-xs font-semibold text-white"
                                                                        style={{ backgroundColor: palette.primary }}
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

                    {/* Existing Treatments (read-only info) */}
                    {disease.treatments.length > 0 && (
                        <motion.div
                            custom={2}
                            variants={sectionVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Card
                                className="border-t-4"
                                style={{ borderTopColor: palette.muted }}
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base" style={{ color: palette.primary }}>
                                            Penanganan Terdaftar
                                        </CardTitle>
                                        <Badge
                                            variant="outline"
                                            style={{ borderColor: palette.muted, color: palette.primary }}
                                        >
                                            {disease.treatments.length} penanganan
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {disease.treatments.map((treatment, idx) => (
                                            <motion.div
                                                key={treatment.id}
                                                initial={{ opacity: 0, x: -12 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: 0.3 + idx * 0.05,
                                                    ease: 'easeOut',
                                                }}
                                                className="flex items-start gap-3 rounded-lg border p-3"
                                                style={{ borderLeftWidth: 3, borderLeftColor: palette.muted }}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                            style={{
                                                                borderColor: palette.secondary,
                                                                color: palette.secondary,
                                                            }}
                                                        >
                                                            {treatmentTypeLabels[treatment.type] ?? treatment.type}
                                                        </Badge>
                                                        {treatment.dosage && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Dosis: {treatment.dosage}
                                                                {treatment.dosage_unit && ` ${treatment.dosage_unit}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                                        {treatment.description}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Actions */}
                    <motion.div
                        custom={3}
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
                            style={{ backgroundColor: palette.primary }}
                        >
                            <Save className="size-4" />
                            {processing ? 'Menyimpan...' : 'Perbarui Penyakit'}
                        </Button>
                    </motion.div>
                </form>
            </div>
        </>
    );
}

AdminDiseasesEdit.layout = {
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
            title: 'Edit Penyakit',
            href: '#',
        },
    ],
};
