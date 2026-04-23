import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, UserCog, Calendar, Activity, Save } from 'lucide-react';
import type { FormEvent} from 'react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const palette = {
    sand: '#DDD8C4',
    sage: '#A3C9A8',
    leaf: '#84B59F',
    teal: '#69A297',
    deep: '#50808E',
};

const roleBadgeColors: Record<string, string> = {
    super_admin: palette.deep,
    admin: palette.teal,
    user: palette.sage,
};

function getRoleBadgeColor(role: string): string {
    return roleBadgeColors[role] || palette.leaf;
}

function formatRoleLabel(role: string): string {
    return role
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

interface Props {
    editUser: {
        id: number;
        name: string;
        email: string;
        role: string;
        detections_count: number;
        created_at: string;
    };
    roles: string[];
}

const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 300, damping: 28 },
    },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

export default function AdminUsersEdit({ editUser, roles }: Props) {
    const [role, setRole] = useState(editUser.role);
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.put(
            `/admin/users/${editUser.id}`,
            {
                name: editUser.name,
                email: editUser.email,
                role,
            },
            {
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title={`Edit User - ${editUser.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Back Button & Header */}
                <motion.div
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        style={{ borderColor: palette.teal, color: palette.teal }}
                    >
                        <Link href="/admin/users">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: palette.deep }}>
                            Edit User
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {editUser.name} &middot; {editUser.email}
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    className="grid gap-6 md:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Form Card */}
                    <motion.div className="md:col-span-2" variants={cardVariants}>
                        <Card className="border" style={{ borderColor: palette.sand }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm" style={{ color: palette.deep }}>
                                    <UserCog className="size-4" style={{ color: palette.teal }} />
                                    Informasi User
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama</Label>
                                        <Input
                                            id="name"
                                            value={editUser.name}
                                            disabled
                                            className="bg-muted/50"
                                            style={{ borderColor: palette.sage }}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Nama tidak dapat diubah dari halaman ini.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            value={editUser.email}
                                            disabled
                                            className="bg-muted/50"
                                            style={{ borderColor: palette.sage }}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Email tidak dapat diubah dari halaman ini.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select value={role} onValueChange={setRole}>
                                            <SelectTrigger
                                                id="role"
                                                className="w-full"
                                                style={{ borderColor: palette.sage }}
                                            >
                                                <SelectValue placeholder="Pilih role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((r) => (
                                                    <SelectItem key={r} value={r}>
                                                        {formatRoleLabel(r)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Tentukan level akses untuk user ini.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <Button
                                            type="submit"
                                            disabled={processing || role === editUser.role}
                                            className="text-white"
                                            style={{ backgroundColor: palette.deep }}
                                        >
                                            <Save className="mr-1.5 size-4" />
                                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            asChild
                                            style={{ borderColor: palette.sage }}
                                        >
                                            <Link href="/admin/users">Batal</Link>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Info Sidebar */}
                    <motion.div className="flex flex-col gap-4" variants={cardVariants}>
                        {/* Current Role */}
                        <Card className="border" style={{ borderColor: palette.sand }}>
                            <CardHeader>
                                <CardTitle className="text-sm" style={{ color: palette.deep }}>
                                    Role Saat Ini
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge
                                    className="text-sm text-white"
                                    style={{ backgroundColor: getRoleBadgeColor(editUser.role) }}
                                >
                                    {formatRoleLabel(editUser.role)}
                                </Badge>
                                {role !== editUser.role && (
                                    <motion.div
                                        className="mt-3 flex items-center gap-2"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <span className="text-xs text-muted-foreground">Akan diubah ke:</span>
                                        <Badge
                                            className="text-sm text-white"
                                            style={{ backgroundColor: getRoleBadgeColor(role) }}
                                        >
                                            {formatRoleLabel(role)}
                                        </Badge>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Detections Count */}
                        <Card className="border" style={{ borderColor: palette.sand }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm" style={{ color: palette.deep }}>
                                    <Activity className="size-4" style={{ color: palette.teal }} />
                                    Jumlah Deteksi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <motion.span
                                    className="text-3xl font-bold tabular-nums"
                                    style={{ color: palette.deep }}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                                >
                                    {editUser.detections_count}
                                </motion.span>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Total deteksi yang telah dilakukan
                                </p>
                            </CardContent>
                        </Card>

                        {/* Registration Date */}
                        <Card className="border" style={{ borderColor: palette.sand }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm" style={{ color: palette.deep }}>
                                    <Calendar className="size-4" style={{ color: palette.teal }} />
                                    Tanggal Registrasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm font-medium" style={{ color: palette.deep }}>
                                    {formatDate(editUser.created_at)}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}

AdminUsersEdit.layout = {
    breadcrumbs: [
        {
            title: 'Super Admin',
            href: '/admin/users',
        },
        {
            title: 'Kelola User',
            href: '/admin/users',
        },
        {
            title: 'Edit User',
            href: '#',
        },
    ],
};
