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

// Knowledge Base Management (pakar + super_admin)
const knowledgeBaseNavItems: NavItem[] = [
    { title: 'Kelola Penyakit', href: '/admin/knowledge-base/diseases', icon: Bug },
    { title: 'Kelola Gejala', href: '/admin/knowledge-base/symptoms', icon: ClipboardList },
    { title: 'Kelola Penanganan', href: '/admin/knowledge-base/treatments', icon: Leaf },
];

// System Management (admin + super_admin)
const systemNavItems: NavItem[] = [
    { title: 'Kelola User', href: '/admin/system/users', icon: Users },
];

// Shared Admin (all admin-level roles)
const sharedAdminNavItems: NavItem[] = [
    { title: 'Semua Deteksi', href: '/admin/detections', icon: Shield },
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
    const user = auth.user as { role: string; permissions: { canManageKnowledgeBase: boolean; canManageSystem: boolean; canViewAllDetections: boolean } } | null;
    
    const canManageKnowledgeBase = user?.permissions?.canManageKnowledgeBase ?? false;
    const canManageSystem = user?.permissions?.canManageSystem ?? false;
    const canViewAllDetections = user?.permissions?.canViewAllDetections ?? false;

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

                {canManageKnowledgeBase && (
                    <>
                        <SidebarSeparator className="mx-3" />
                        <AdminNav items={knowledgeBaseNavItems} label="Pakar Pertanian" />
                    </>
                )}

                {canManageSystem && (
                    <>
                        {!canManageKnowledgeBase && <SidebarSeparator className="mx-3" />}
                        <AdminNav items={systemNavItems} label="Admin Sistem" />
                    </>
                )}

                {canViewAllDetections && (
                    <>
                        {!canManageKnowledgeBase && !canManageSystem && <SidebarSeparator className="mx-3" />}
                        <AdminNav items={sharedAdminNavItems} label="Monitoring" />
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
