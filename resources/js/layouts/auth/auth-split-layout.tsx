import { Link } from '@inertiajs/react';
import { Leaf } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-gradient-to-br from-[#50808E] to-[#69A297]" />
                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-2.5 text-lg font-medium"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <Leaf className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold">Mapan</span>
                </Link>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex flex-col items-center justify-center gap-2 lg:hidden"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#50808E] to-[#69A297] shadow-lg shadow-[#50808E]/25">
                            <Leaf className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Mapan</span>
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
