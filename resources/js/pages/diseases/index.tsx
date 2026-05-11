import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bug, BookOpen } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cssVars } from '@/lib/utils';
import { MetaHead } from '@/components/meta-head';

// Color palette
const palette = {
    primary: '#059669',
    secondary: '#10b981',
    muted: '#64748b',
    light: '#94a3b8',
    lightest: '#cbd5e1',
};

interface Disease {
    id: number;
    name: string;
    slug: string;
    latin_name: string | null;
    description: string;
    cause: string;
    image: string | null;
    detections_count: number;
}

interface Props {
    diseases: Disease[];
    meta?: any;
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

export default function DiseasesIndex({ diseases, meta }: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) {
return diseases;
}

        const q = search.toLowerCase();

        return diseases.filter(
            (d) =>
                d.name.toLowerCase().includes(q) ||
                d.latin_name?.toLowerCase().includes(q) ||
                d.description.toLowerCase().includes(q),
        );
    }, [diseases, search]);

    return (
        <>
            <MetaHead meta={meta} />

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
                            Basis Pengetahuan Penyakit Padi
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Informasi lengkap mengenai penyakit pada tanaman padi
                        </p>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search
                            className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
                            style={{ color: palette.secondary }}
                        />
                        <Input
                            placeholder="Cari penyakit..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 transition-colors focus-visible:ring-1"
                            style={{
                                borderColor: palette.light,
                                ...cssVars({ '--tw-ring-color': palette.secondary }),
                            }}
                        />
                    </div>
                </motion.div>

                {/* Grid */}
                <AnimatePresence mode="wait">
                    {filtered.length > 0 ? (
                        <motion.div
                            key="grid"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                        >
                            {filtered.map((disease) => (
                                <motion.div
                                    key={disease.id}
                                    variants={cardVariants}
                                    whileHover={{
                                        scale: 1.03,
                                        boxShadow: `0 8px 30px ${palette.secondary}30`,
                                        transition: { duration: 0.25 },
                                    }}
                                    className="rounded-xl"
                                >
                                    <Link
                                        href={`/diseases/${disease.slug}`}
                                        className="group block h-full"
                                    >
                                    <Card className="h-full overflow-hidden border transition-colors duration-200 hover:border-[var(--card-hover-border)]"
                                        style={cssVars({ '--card-hover-border': palette.light })}
                                    >
                                            {disease.image && (
                                                <div className="overflow-hidden rounded-t-xl">
                                                    <img
                                                        src={disease.image}
                                                        alt={disease.name}
                                                        className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                </div>
                                            )}
                                            <CardHeader>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <CardTitle className="text-base">
                                                            {disease.name}
                                                        </CardTitle>
                                                        {disease.latin_name && (
                                                            <p className="mt-1 text-sm italic text-muted-foreground">
                                                                {disease.latin_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className="shrink-0 text-white"
                                                        style={{ backgroundColor: palette.secondary }}
                                                    >
                                                        <Bug className="size-3" />
                                                        {disease.detections_count} deteksi
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="line-clamp-3 text-sm text-muted-foreground">
                                                    {disease.description}
                                                </p>
                                            </CardContent>
                                            <CardFooter>
                                                <span
                                                    className="text-sm font-medium group-hover:underline"
                                                    style={{ color: palette.primary }}
                                                >
                                                    Lihat detail &rarr;
                                                </span>
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16"
                            style={{ borderColor: palette.lightest }}
                        >
                            <BookOpen className="size-10" style={{ color: `${palette.secondary}80` }} />
                            <p className="text-sm text-muted-foreground">
                                {search.trim()
                                    ? `Tidak ditemukan penyakit untuk "${search}"`
                                    : 'Belum ada data penyakit'}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}

DiseasesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Basis Pengetahuan',
            href: '/diseases',
        },
    ],
};
