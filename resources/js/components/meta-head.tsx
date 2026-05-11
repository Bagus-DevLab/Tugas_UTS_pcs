import { Head } from '@inertiajs/react';

interface MetaTag {
    title: string;
    description: string;
    keywords: string;
    og_title: string;
    og_description: string;
    og_image: string;
    og_type: string;
    og_url: string;
    canonical: string;
}

interface MetaHeadProps {
    meta?: MetaTag;
    children?: React.ReactNode;
}

export function MetaHead({ meta, children }: MetaHeadProps) {
    if (!meta) {
        return <Head>{children}</Head>;
    }

    return (
        <Head title={meta.title}>
            {/* Primary Meta Tags */}
            <meta name="description" content={meta.description} />
            <meta name="keywords" content={meta.keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={meta.og_type} />
            <meta property="og:url" content={meta.og_url} />
            <meta property="og:title" content={meta.og_title} />
            <meta property="og:description" content={meta.og_description} />
            <meta property="og:image" content={meta.og_image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={meta.og_url} />
            <meta property="twitter:title" content={meta.og_title} />
            <meta property="twitter:description" content={meta.og_description} />
            <meta property="twitter:image" content={meta.og_image} />

            {/* Canonical URL */}
            <link rel="canonical" href={meta.canonical} />

            {children}
        </Head>
    );
}
