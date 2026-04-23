import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ArrowLeft, FlaskConical, Leaf, Shield, Sprout, Pill } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Symptom {
    id: number;
    code: string;
    name: string;
    description: string | null;
    pivot: { weight: number };
}

interface Treatment {
    id: number;
    type: string;
    description: string;
    dosage: string | null;
    dosage_unit: string | null;
    priority: number;
}

interface Disease {
    id: number;
    name: string;
    slug: string;
    latin_name: string | null;
    description: string;
    cause: string;
    image: string | null;
    symptoms: Symptom[];
    treatments: Treatment[];
}

interface Props {
    disease: Disease;
}

const treatmentTypes: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    prevention: { label: 'Pencegahan', icon: Shield, color: 'bg-blue-500' },
    chemical: { label: 'Kimiawi', icon: FlaskConical, color: 'bg-red-500' },
    biological: { label: 'Biologis', icon: Sprout, color: 'bg-green-500' },
    cultural: { label: 'Kultur Teknis', icon: Leaf, color: 'bg-amber-500' },
};

export default function DiseaseShow({ disease }: Props) {
    const [activeTab, setActiveTab] = useState<string>('all');

    const groupedTreatments = useMemo(() => {
        const groups: Record<string, Treatment[]> = {};
        for (const t of disease.treatments) {
            if (!groups[t.type]) groups[t.type] = [];
            groups[t.type].push(t);
        }
        // Sort each group by priority
        for (const key of Object.keys(groups)) {
            groups[key].sort((a, b) => a.priority - b.priority);
        }
        return groups;
    }, [disease.treatments]);

    const availableTypes = Object.keys(groupedTreatments);

    const displayedTreatments = useMemo(() => {
        if (activeTab === 'all') return disease.treatments.slice().sort((a, b) => a.priority - b.priority);
        return groupedTreatments[activeTab] ?? [];
    }, [activeTab, disease.treatments, groupedTreatments]);

    return (
        <>
            <Head title={disease.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Back button */}
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/diseases">
                            <ArrowLeft className="size-4" />
                            Kembali ke Basis Pengetahuan
                        </Link>
                    </Button>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                    {disease.image && (
                        <div className="shrink-0 overflow-hidden rounded-xl border">
                            <img
                                src={disease.image}
                                alt={disease.name}
                                className="h-48 w-full object-cover md:h-40 md:w-56"
                            />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {disease.name}
                        </h1>
                        {disease.latin_name && (
                            <p className="mt-1 text-base italic text-muted-foreground">
                                {disease.latin_name}
                            </p>
                        )}
                    </div>
                </div>

                {/* Description & Cause */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Deskripsi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {disease.description}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Penyebab</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {disease.cause}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Symptoms */}
                {disease.symptoms.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Gejala</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 pr-4 font-medium text-muted-foreground">
                                                Kode
                                            </th>
                                            <th className="pb-3 pr-4 font-medium text-muted-foreground">
                                                Nama Gejala
                                            </th>
                                            <th className="pb-3 font-medium text-muted-foreground">
                                                Bobot
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {disease.symptoms.map((symptom) => (
                                            <tr
                                                key={symptom.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="py-3 pr-4">
                                                    <Badge variant="outline">
                                                        {symptom.code}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <div>
                                                        <span className="font-medium">
                                                            {symptom.name}
                                                        </span>
                                                        {symptom.description && (
                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                {symptom.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className="h-full rounded-full bg-primary transition-all"
                                                                style={{
                                                                    width: `${symptom.pivot.weight * 100}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="min-w-[3ch] text-right text-xs text-muted-foreground">
                                                            {Math.round(symptom.pivot.weight * 100)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Treatments */}
                {disease.treatments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle className="text-base">Penanganan</CardTitle>
                                <div className="flex flex-wrap gap-1.5">
                                    <button
                                        onClick={() => setActiveTab('all')}
                                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                            activeTab === 'all'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                    >
                                        Semua
                                    </button>
                                    {availableTypes.map((type) => {
                                        const config = treatmentTypes[type];
                                        if (!config) return null;
                                        const Icon = config.icon;
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => setActiveTab(type)}
                                                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                                    activeTab === type
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                }`}
                                            >
                                                <Icon className="size-3" />
                                                {config.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {displayedTreatments.map((treatment) => {
                                    const config = treatmentTypes[treatment.type];
                                    return (
                                        <div
                                            key={treatment.id}
                                            className="flex gap-3 rounded-lg border p-4"
                                        >
                                            {config && (
                                                <div
                                                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-white ${config.color}`}
                                                >
                                                    <config.icon className="size-4" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    {config && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {config.label}
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                        Prioritas {treatment.priority}
                                                    </span>
                                                </div>
                                                <p className="text-sm leading-relaxed">
                                                    {treatment.description}
                                                </p>
                                                {(treatment.dosage || treatment.dosage_unit) && (
                                                    <div className="mt-2 flex items-center gap-1.5">
                                                        <Pill className="size-3.5 text-muted-foreground" />
                                                        <span className="text-xs font-medium text-muted-foreground">
                                                            Dosis:{' '}
                                                            <span className="text-foreground">
                                                                {treatment.dosage}
                                                                {treatment.dosage_unit &&
                                                                    ` ${treatment.dosage_unit}`}
                                                            </span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

DiseaseShow.layout = {
    breadcrumbs: [
        {
            title: 'Basis Pengetahuan',
            href: '/diseases',
        },
        {
            title: 'Detail Penyakit',
            href: '#',
        },
    ],
};
