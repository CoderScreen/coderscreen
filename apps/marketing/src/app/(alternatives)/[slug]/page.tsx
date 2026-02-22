import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AlternativePageView } from '@/components/alternative/AlternativePageView';
import { competitorData } from '@/lib/alternativeConfig';
import { buildBreadcrumbSchema } from '@/lib/breadcrumbs';

export function generateStaticParams() {
  return Object.keys(competitorData).map((key) => ({
    slug: key,
  }));
}

interface AlternativeCompetitorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: AlternativeCompetitorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const competitor = competitorData[slug];

  if (!competitor) {
    return {
      title: 'Not Found',
    };
  }

  const siteUrl = 'https://coderscreen.com';
  const pageUrl = `${siteUrl}/${slug}`;

  return {
    title: competitor.seo.title,
    description: competitor.seo.description,
    keywords: competitor.seo.keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: competitor.seo.title,
      description: competitor.seo.description,
      url: pageUrl,
      siteName: 'CoderScreen',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `CoderScreen vs ${competitor.displayName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: competitor.seo.title,
      description: competitor.seo.description,
      images: [`${siteUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function AlternativeCompetitorPage({
  params,
}: AlternativeCompetitorPageProps) {
  const { slug } = await params;

  const competitor = competitorData[slug];
  if (!competitor) {
    notFound();
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: `${competitor.displayName} Alternative`, href: `/${slug}` },
  ]);

  return (
    <>
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: needed for SEO schema
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AlternativePageView competitor={competitor} />
    </>
  );
}
