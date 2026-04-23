import { Link } from '@inertiajs/react';
import { Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#DDD8C4]/40 via-[#A3C9A8]/20 to-[#69A297]/30" />

            {/* Decorative blobs */}
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#84B59F]/15 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#50808E]/10 blur-3xl" />
            <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-[#A3C9A8]/10 blur-2xl" />

            {/* Subtle leaf pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24' fill='none' stroke='%2350808E' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z'/%3E%3Cpath d='M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px',
                }}
            />

            <Card className="relative z-10 w-full max-w-sm border-[#A3C9A8]/30 bg-card/95 shadow-lg shadow-[#50808E]/10 backdrop-blur-sm">
                <CardHeader className="items-center pb-0">
                    <Link
                        href={home()}
                        className="flex flex-col items-center gap-3 font-medium"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#50808E] to-[#69A297] shadow-lg shadow-[#50808E]/25">
                            <Leaf className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            Mapan
                        </span>
                    </Link>

                    <div className="mt-2 space-y-1.5 text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </CardHeader>

                <div className="px-6">
                    <Separator className="bg-[#A3C9A8]/30" />
                </div>

                <CardContent>{children}</CardContent>
            </Card>

            {/* Bottom branding */}
            <p className="relative z-10 mt-6 text-xs text-muted-foreground/60">
                &copy; {new Date().getFullYear()} Mapan. All rights reserved.
            </p>
        </div>
    );
}
