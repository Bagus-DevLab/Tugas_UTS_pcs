import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Search, Bug, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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
}

export default function DiseasesIndex({ diseases }: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return diseases;
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
            <Head title="Basis Pengetahuan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Basis Pengetahuan Penyakit Padi
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Informasi lengkap mengenai penyakit pada tanaman padi
                        </p>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari penyakit..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Grid */}
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((disease) => (
                            <Link
                                key={disease.id}
                                href={`/diseases/${disease.slug}`}
                                className="group"
                            >
                                <Card className="h-full transition-shadow duration-200 group-hover:shadow-md">
                                    {disease.image && (
                                        <div className="overflow-hidden rounded-t-xl">
                                            <img
                                                src={disease.image}
                                                alt={disease.name}
                                                className="h-40 w-full object-cover transition-transform duration-200 group-hover:scale-105"
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
                                            <Badge variant="secondary" className="shrink-0">
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
                                        <span className="text-sm font-medium text-primary group-hover:underline">
                                            Lihat detail &rarr;
                                        </span>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16">
                        <BookOpen className="size-10 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                            {search.trim()
                                ? `Tidak ditemukan penyakit untuk "${search}"`
                                : 'Belum ada data penyakit'}
                        </p>
                    </div>
                )}
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
