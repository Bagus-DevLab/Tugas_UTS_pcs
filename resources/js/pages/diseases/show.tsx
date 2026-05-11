import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FlaskConical, Leaf, Shield, Sprout, Pill } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetaHead } from '@/components/meta-head';

// Color palette
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
    meta?: any;
}

const treatmentTypes: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    prevention: { label: 'Pencegahan', icon: Shield, color: palette.primary },
    chemical: { label: 'Kimiawi', icon: FlaskConical, color: '#c0392b' },
    biological: { label: 'Biologis', icon: Sprout, color: palette.muted },
    cultural: { label: 'Kultur Teknis', icon: Leaf, color: palette.secondary },
};

// Generate JSON-LD structured data for disease
function generateDiseaseStructuredData(disease: Disease) {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mapan.test';
    const imageUrl = disease.image ? `${appUrl}/storage/${disease.image}` : `${appUrl}/images/og-default.jpg`;

    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: disease.name,
        alternativeHeadline: disease.latin_name || undefined,
        image: imageUrl,
        description: disease.description,
        articleBody: disease.description,
        author: {
            '@type': 'Organization',
            name: 'MAPAN - Sistem Pakar Penyakit Padi',
        },
        publisher: {
            '@type': 'Organization',
            name: 'MAPAN',
            logo: {
                '@type': 'ImageObject',
                url: `${appUrl}/images/og-default.jpg`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${appUrl}/diseases/${disease.slug}`,
        },
        about: {
            '@type': 'Thing',
            name: disease.name,
            description: disease.cause,
        },
        keywords: [
            'penyakit padi',
            disease.name.toLowerCase(),
            ...disease.symptoms.slice(0, 5).map((s) => s.name.toLowerCase()),
        ].join(', '),
    };
}

// Generate BreadcrumbList JSON-LD for navigation
function generateBreadcrumbSchema(disease: Disease) {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mapan.test';

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Beranda',
                item: appUrl,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Penyakit',
                item: `${appUrl}/diseases`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: disease.name,
                item: `${appUrl}/diseases/${disease.slug}`,
            },
        ],
    };
}

// Animation variants
const sectionVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut', delay: i * 0.12 },
    }),
};

const treatmentCardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { duration: 0.35, ease: 'easeOut', delay: i * 0.07 },
    }),
};

export default function DiseaseShow({ disease, meta }: Props) {
    const [activeTab, setActiveTab] = useState<string>('all');

    const groupedTreatments = useMemo(() => {
        const groups: Record<string, Treatment[]> = {};

        for (const t of disease.treatments) {
            if (!groups[t.type]) {
groups[t.type] = [];
}

            (groups[t.type] ??= []).push(t);
        }

        // Sort each group by priority
        for (const key of Object.keys(groups)) {
            groups[key]!.sort((a, b) => a.priority - b.priority);
        }

        return groups;
    }, [disease.treatments]);

    const availableTypes = Object.keys(groupedTreatments);

    const displayedTreatments = useMemo(() => {
        if (activeTab === 'all') {
return disease.treatments.slice().sort((a, b) => a.priority - b.priority);
}

        return groupedTreatments[activeTab] ?? [];
    }, [activeTab, disease.treatments, groupedTreatments]);

    return (
        <>
            <MetaHead meta={meta}>
                {/* Article Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(generateDiseaseStructuredData(disease)),
                    }}
                />
                {/* Breadcrumb Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(generateBreadcrumbSchema(disease)),
                    }}
                />
            </MetaHead>

            <main className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Back button */}
                <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/diseases">
                            <ArrowLeft className="size-4" />
                            Kembali ke Basis Pengetahuan
                        </Link>
                    </Button>
                </motion.div>

                {/* Header */}
                <motion.div
                    custom={0}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6"
                >
                    {disease.image && (
                        <div
                            className="shrink-0 overflow-hidden rounded-xl border-2"
                            style={{ borderColor: palette.light }}
                        >
                            <img
                                src={disease.image}
                                alt={`Ilustrasi gejala penyakit ${disease.name} pada tanaman padi`}
                                className="h-48 w-full object-cover md:h-40 md:w-56"
                            />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {disease.name}
                        </h1>
                        {disease.latin_name && (
                            <p className="mt-1 text-base italic" style={{ color: palette.secondary }}>
                                {disease.latin_name}
                            </p>
                        )}
                    </div>
                </motion.div>

                {/* Description & Cause */}
                <article>
                    <motion.div
                        custom={1}
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
                    >
                        <Card
                            className="border-t-4"
                            style={{ borderTopColor: palette.light }}
                        >
                            <CardHeader>
                                <CardTitle className="text-base" style={{ color: palette.primary }}>
                                    Deskripsi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {disease.description}
                                </p>
                            </CardContent>
                        </Card>
                        <Card
                            className="border-t-4"
                            style={{ borderTopColor: palette.secondary }}
                        >
                            <CardHeader>
                                <CardTitle className="text-base" style={{ color: palette.primary }}>
                                    Penyebab
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {disease.cause}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </article>

                {/* Symptoms */}
                {disease.symptoms.length > 0 && (
                    <section aria-labelledby="symptoms-heading">
                        <motion.div
                            custom={2}
                            variants={sectionVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle
                                        id="symptoms-heading"
                                        className="text-base"
                                        style={{ color: palette.primary }}
                                    >
                                        <h2 className="text-base font-semibold">Gejala Penyakit</h2>
                                    </CardTitle>
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
                                            {disease.symptoms.map((symptom, idx) => (
                                                <motion.tr
                                                    key={symptom.id}
                                                    initial={{ opacity: 0, x: -12 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{
                                                        duration: 0.35,
                                                        delay: 0.3 + idx * 0.06,
                                                        ease: 'easeOut',
                                                    }}
                                                    className="border-b last:border-0"
                                                >
                                                    <td className="py-3 pr-4">
                                                        <Badge
                                                            variant="outline"
                                                            style={{
                                                                borderColor: palette.secondary,
                                                                color: palette.primary,
                                                            }}
                                                        >
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
                                                            <div
                                                                className="h-2.5 w-24 overflow-hidden rounded-full"
                                                                style={{ backgroundColor: `${palette.lightest}` }}
                                                            >
                                                                <motion.div
                                                                    className="h-full rounded-full"
                                                                    style={{
                                                                        background: `linear-gradient(90deg, ${palette.light}, ${palette.secondary})`,
                                                                    }}
                                                                    initial={{ width: 0 }}
                                                                    animate={{
                                                                        width: `${symptom.pivot.weight * 100}%`,
                                                                    }}
                                                                    transition={{
                                                                        duration: 0.8,
                                                                        delay: 0.4 + idx * 0.08,
                                                                        ease: 'easeOut',
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="min-w-[3ch] text-right text-xs text-muted-foreground">
                                                                {Math.round(symptom.pivot.weight * 100)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    </section>
                )}

                {/* Treatments */}
                {disease.treatments.length > 0 && (
                    <section aria-labelledby="treatments-heading">
                        <motion.div
                            custom={3}
                            variants={sectionVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <CardTitle
                                            id="treatments-heading"
                                            className="text-base"
                                            style={{ color: palette.primary }}
                                        >
                                            <h2 className="text-base font-semibold">Penanganan</h2>
                                        </CardTitle>
                                    <div className="flex flex-wrap gap-1.5">
                                        <button
                                            onClick={() => setActiveTab('all')}
                                            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                                            style={{
                                                backgroundColor: activeTab === 'all' ? palette.primary : palette.lightest,
                                                color: activeTab === 'all' ? '#fff' : palette.primary,
                                            }}
                                        >
                                            Semua
                                        </button>
                                        {availableTypes.map((type) => {
                                            const config = treatmentTypes[type];

                                            if (!config) {
return null;
}

                                            const Icon = config.icon;

                                            return (
                                                <button
                                                    key={type}
                                                    onClick={() => setActiveTab(type)}
                                                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                                                    style={{
                                                        backgroundColor: activeTab === type ? config.color : palette.lightest,
                                                        color: activeTab === type ? '#fff' : palette.primary,
                                                    }}
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
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                        className="space-y-3"
                                    >
                                        {displayedTreatments.map((treatment, idx) => {
                                            const config = treatmentTypes[treatment.type];

                                            return (
                                                <motion.div
                                                    key={treatment.id}
                                                    custom={idx}
                                                    variants={treatmentCardVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    className="flex gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/30"
                                                    style={{ borderLeftWidth: 3, borderLeftColor: config?.color ?? palette.secondary }}
                                                >
                                                    {config && (
                                                        <div
                                                            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-white"
                                                            style={{ backgroundColor: config.color }}
                                                        >
                                                            <config.icon className="size-4" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            {config && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                    style={{
                                                                        borderColor: config.color,
                                                                        color: config.color,
                                                                    }}
                                                                >
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
                                                                <Pill className="size-3.5" style={{ color: palette.secondary }} />
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
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>
                    </section>
                )}
            </main>
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
