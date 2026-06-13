import { Head, usePage } from '@inertiajs/react';
import { toAbsoluteUrl, truncateDescription } from '@/lib/seo';
import type { SeoDefaults } from '@/types/seo';

type JsonLd = Record<string, unknown>;

type Props = {
    title: string;
    description?: string;
    path: string;
    image?: string | null;
    type?: 'website' | 'product' | 'profile';
    noindex?: boolean;
    jsonLd?: JsonLd | JsonLd[];
};

export function SeoHead({
    title,
    description,
    path,
    image,
    type = 'website',
    noindex = false,
    jsonLd,
}: Props) {
    const { seo } = usePage<{ seo: SeoDefaults }>().props;
    const metaDescription = truncateDescription(
        description ?? seo.defaultDescription,
    );
    const canonical = toAbsoluteUrl(seo.appUrl, path);
    const ogImage = toAbsoluteUrl(
        seo.appUrl,
        image ?? seo.defaultImage,
    );
    const ogType = type === 'product' ? 'product' : 'website';
    const jsonLdItems = jsonLd
        ? Array.isArray(jsonLd)
            ? jsonLd
            : [jsonLd]
        : [];

    return (
        <Head title={title}>
            <meta
                head-key="description"
                name="description"
                content={metaDescription}
            />
            <link head-key="canonical" rel="canonical" href={canonical} />

            {noindex && (
                <meta
                    head-key="robots"
                    name="robots"
                    content="noindex, nofollow"
                />
            )}

            <meta head-key="og:title" property="og:title" content={title} />
            <meta
                head-key="og:description"
                property="og:description"
                content={metaDescription}
            />
            <meta head-key="og:url" property="og:url" content={canonical} />
            <meta head-key="og:type" property="og:type" content={ogType} />
            <meta head-key="og:image" property="og:image" content={ogImage} />
            <meta
                head-key="og:site_name"
                property="og:site_name"
                content={seo.siteName}
            />

            <meta
                head-key="twitter:card"
                name="twitter:card"
                content="summary_large_image"
            />
            <meta
                head-key="twitter:title"
                name="twitter:title"
                content={title}
            />
            <meta
                head-key="twitter:description"
                name="twitter:description"
                content={metaDescription}
            />
            <meta
                head-key="twitter:image"
                name="twitter:image"
                content={ogImage}
            />
            {seo.twitterHandle && (
                <meta
                    head-key="twitter:site"
                    name="twitter:site"
                    content={seo.twitterHandle}
                />
            )}

            {jsonLdItems.map((item, index) => (
                <script
                    key={index}
                    head-key={`json-ld-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(item),
                    }}
                />
            ))}
        </Head>
    );
}

export function PrivatePageHead({ title }: { title: string }) {
    return (
        <SeoHead
            title={title}
            path="/"
            noindex
        />
    );
}
