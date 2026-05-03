import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Pencil, Trash2, ChevronLeft, ChevronRight, Users, Inbox } from 'lucide-react';
import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

const roleBadgeColors: Record<string, string> = {
    super_admin: palette.primary,
    admin: palette.secondary,
    user: palette.light,
};

function getRoleBadgeColor(role: string): string {
    return roleBadgeColors[role] || palette.muted;
}

function formatRoleLabel(role: string): string {
    return role
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    detections_count: number;
    created_at: string;
}

interface Props {
    users: {
        data: User[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string; role?: string };
    roles: string[];
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
    },
};

const filterBarVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 400, damping: 30, staggerChildren: 0.06 },
    },
};

const filterItemVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 400, damping: 28 },
    },
};

export default function AdminUsersIndex({ users, filters, roles }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [deleting, setDeleting] = useState(false);

    function handleFilterChange(key: string, value: string) {
        const params: Record<string, string> = {
            ...(filters.search && { search: filters.search }),
            ...(filters.role && { role: filters.role }),
        };

        if (value && value !== 'all') {
            params[key] = value;
        } else {
            delete params[key];
        }

        router.get('/admin/users', params, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function handleSearchChange(value: string) {
        const params: Record<string, string> = {
            ...(filters.role && { role: filters.role }),
        };

        if (value.trim()) {
            params.search = value;
        }

        router.get('/admin/users', params, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function handleReset() {
        router.get('/admin/users', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function handleDelete() {
        if (!deleteTarget) {
return;
}

        setDeleting(true);
        router.delete(`/admin/users/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    }

    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    function handleSearchInput(value: string) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => handleSearchChange(value), 400);
    }

    return (
        <>
            <Head title="Kelola User - Super Admin" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col gap-1"
                >
                    <div className="flex items-center gap-2">
                        <Users className="size-5" style={{ color: palette.primary }} />
                        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: palette.primary }}>
                            Kelola User
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Manajemen pengguna dan pengaturan role akses sistem.
                    </p>
                </motion.div>

                {/* Filter Bar */}
                <motion.div
                    className="flex flex-wrap items-end gap-3"
                    variants={filterBarVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="flex flex-col gap-1.5" variants={filterItemVariants}>
                        <label className="text-xs font-medium text-muted-foreground">Cari</label>
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
                                style={{ color: palette.secondary }}
                            />
                            <Input
                                placeholder="Nama atau email..."
                                defaultValue={filters.search || ''}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                className="w-[220px] pl-9"
                                style={{ borderColor: palette.light }}
                            />
                        </div>
                    </motion.div>

                    <motion.div className="flex flex-col gap-1.5" variants={filterItemVariants}>
                        <label className="text-xs font-medium text-muted-foreground">Role</label>
                        <Select
                            value={filters.role || 'all'}
                            onValueChange={(value) => handleFilterChange('role', value)}
                        >
                            <SelectTrigger className="w-[160px]" style={{ borderColor: palette.light }}>
                                <SelectValue placeholder="Semua Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Role</SelectItem>
                                {roles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {formatRoleLabel(role)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </motion.div>

                    <motion.div variants={filterItemVariants}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="transition-colors hover:text-white"
                            style={{ borderColor: palette.secondary, color: palette.secondary }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = palette.secondary;
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                            }}
                        >
                            <Filter className="mr-1.5 size-3.5" />
                            Reset
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Table */}
                <AnimatePresence mode="wait">
                    {users.data.length > 0 ? (
                        <motion.div
                            key="table"
                            className="overflow-hidden rounded-xl border"
                            style={{ borderColor: palette.lightest }}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.35 }}
                        >
                            <Table>
                                <TableHeader>
                                    <TableRow style={{ backgroundColor: `${palette.lightest}33` }}>
                                        <TableHead style={{ color: palette.primary }}>Nama</TableHead>
                                        <TableHead style={{ color: palette.primary }}>Email</TableHead>
                                        <TableHead style={{ color: palette.primary }}>Role</TableHead>
                                        <TableHead style={{ color: palette.primary }}>Deteksi</TableHead>
                                        <TableHead style={{ color: palette.primary }}>Terdaftar</TableHead>
                                        <TableHead style={{ color: palette.primary }}>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {users.data.map((user, index) => (
                                            <motion.tr
                                                key={user.id}
                                                className="border-b transition-colors last:border-b-0"
                                                variants={rowVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.04 }}
                                                whileHover={{
                                                    backgroundColor: `${palette.light}18`,
                                                    transition: { duration: 0.15 },
                                                }}
                                            >
                                                <TableCell className="font-medium">
                                                    {user.name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className="text-white"
                                                        style={{ backgroundColor: getRoleBadgeColor(user.role) }}
                                                    >
                                                        {formatRoleLabel(user.role)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-sm" style={{ color: palette.primary }}>
                                                        {user.detections_count}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(user.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/users/${user.id}/edit`}>
                                                                <Pencil className="size-4" style={{ color: palette.secondary }} />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 hover:text-red-600"
                                                            onClick={() => setDeleteTarget(user)}
                                                            disabled={user.id === auth.user.id}
                                                            title={
                                                                user.id === auth.user.id
                                                                    ? 'Tidak dapat menghapus akun sendiri'
                                                                    : 'Hapus user'
                                                            }
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16"
                            style={{ borderColor: palette.lightest }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Inbox className="mb-4 size-12" style={{ color: `${palette.secondary}66` }} />
                            <h3 className="text-lg font-medium" style={{ color: palette.primary }}>
                                Tidak Ada User
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Tidak ditemukan user yang sesuai dengan filter.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    >
                        <p className="text-sm text-muted-foreground">
                            Total {users.total} user
                        </p>
                        <div className="flex items-center gap-1">
                            {users.links.map((link, index) => {
                                if (index === 0) {
                                    return (
                                        <Button
                                            key="prev"
                                            variant="outline"
                                            size="icon"
                                            className="size-8"
                                            style={{ borderColor: palette.light }}
                                            disabled={!link.url}
                                            asChild={!!link.url}
                                        >
                                            {link.url ? (
                                                <Link href={link.url} preserveState preserveScroll>
                                                    <ChevronLeft className="size-4" />
                                                </Link>
                                            ) : (
                                                <ChevronLeft className="size-4" />
                                            )}
                                        </Button>
                                    );
                                }

                                if (index === users.links.length - 1) {
                                    return (
                                        <Button
                                            key="next"
                                            variant="outline"
                                            size="icon"
                                            className="size-8"
                                            style={{ borderColor: palette.light }}
                                            disabled={!link.url}
                                            asChild={!!link.url}
                                        >
                                            {link.url ? (
                                                <Link href={link.url} preserveState preserveScroll>
                                                    <ChevronRight className="size-4" />
                                                </Link>
                                            ) : (
                                                <ChevronRight className="size-4" />
                                            )}
                                        </Button>
                                    );
                                }

                                return (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="icon"
                                        className="size-8 text-white"
                                        style={
                                            link.active
                                                ? { backgroundColor: palette.primary, borderColor: palette.primary }
                                                : { borderColor: palette.light }
                                        }
                                        disabled={!link.url}
                                        asChild={!!link.url}
                                    >
                                        {link.url ? (
                                            <Link href={link.url} preserveState preserveScroll>
                                                {link.label.replace(/&laquo;/g, '\u00AB').replace(/&raquo;/g, '\u00BB')}
                                            </Link>
                                        ) : (
                                            <span>{link.label.replace(/&laquo;/g, '\u00AB').replace(/&raquo;/g, '\u00BB')}</span>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus User</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus user <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})?
                            Semua data deteksi milik user ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
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

AdminUsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Super Admin',
            href: '/admin/users',
        },
        {
            title: 'Kelola User',
            href: '/admin/users',
        },
    ],
};
