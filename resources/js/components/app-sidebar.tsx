import { Link, usePage } from '@inertiajs/react';
import { BookOpen, BrainCircuit, Bug, ClipboardList, History, LayoutGrid, Leaf, ScanLine, Shield, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Deteksi Penyakit', href: '/detection', icon: ScanLine },
    { title: 'Sistem Pakar', href: '/expert-system', icon: BrainCircuit },
    { title: 'Knowledge Base', href: '/diseases', icon: BookOpen },
    { title: 'Riwayat Deteksi', href: '/detection/history', icon: History },
];

// Admin + Super Admin menu items
const adminNavItems: NavItem[] = [
    { title: 'Kelola Penyakit', href: '/admin/diseases', icon: Bug },
    { title: 'Kelola Gejala', href: '/admin/symptoms', icon: ClipboardList },
    { title: 'Kelola Penanganan', href: '/admin/treatments', icon: Leaf },
    { title: 'Semua Deteksi', href: '/admin/detections', icon: Shield },
];

// Super Admin only
const superAdminNavItems: NavItem[] = [
    { title: 'Kelola User', href: '/admin/users', icon: Users },
];

function AdminNav({ items, label }: { items: NavItem[]; label: string }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

export function AppSidebar() {
    const { auth } = usePage().props;
    const role = auth.user?.role as string | undefined;
    const isAdmin = role === 'admin' || role === 'super_admin';
    const isSuperAdmin = role === 'super_admin';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />

                {isAdmin && (
                    <>
                        <SidebarSeparator className="mx-3" />
                        <AdminNav items={adminNavItems} label="Admin" />
                    </>
                )}

                {isSuperAdmin && (
                    <AdminNav items={superAdminNavItems} label="Super Admin" />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
