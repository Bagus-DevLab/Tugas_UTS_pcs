import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Type-safe CSS custom properties for inline styles.
 * Eliminates @ts-expect-error for CSS variables like '--tw-ring-color'.
 *
 * @example
 * ```tsx
 * <div style={cssVars({ '--progress': '75%', '--color': '#3b82f6' })} />
 * ```
 */
export function cssVars(vars: Record<string, string | number>): React.CSSProperties {
    return vars as React.CSSProperties;
}
