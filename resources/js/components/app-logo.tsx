import { Leaf } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-emerald-600 shadow-sm">
                <Leaf className="size-5 text-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold tracking-tight">
                    Mapan
                </span>
            </div>
        </>
    );
}
