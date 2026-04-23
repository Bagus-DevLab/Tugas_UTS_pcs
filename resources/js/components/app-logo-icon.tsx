import { Leaf } from 'lucide-react';

interface AppLogoIconProps {
    className?: string;
}

export default function AppLogoIcon({ className }: AppLogoIconProps) {
    return <Leaf className={className} />;
}
