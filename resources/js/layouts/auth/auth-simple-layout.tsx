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
        <div className="relative flex min-h-svh flex-col items-center justify-center bg-slate-50 p-6 md:p-10">
            <Card className="relative z-10 w-full max-w-sm border-slate-200 bg-white shadow-md">
                <CardHeader className="items-center pb-0">
                    <Link
                        href={home()}
                        className="flex flex-col items-center gap-3 font-medium"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-md">
                            <Leaf className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">
                            Mapan
                        </span>
                    </Link>

                    <div className="mt-2 space-y-1.5 text-center">
                        <h1 className="text-xl font-medium text-slate-900">{title}</h1>
                        <p className="text-sm text-slate-500">
                            {description}
                        </p>
                    </div>
                </CardHeader>

                <div className="px-6">
                    <Separator />
                </div>

                <CardContent>{children}</CardContent>
            </Card>

            {/* Bottom branding */}
            <p className="relative z-10 mt-6 text-xs text-slate-400">
                &copy; {new Date().getFullYear()} Mapan. All rights reserved.
            </p>
        </div>
    );
}
