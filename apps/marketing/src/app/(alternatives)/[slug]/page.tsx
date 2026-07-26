import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AlternativePageView } from '@/components/alternative/AlternativePageView';
import { RoundupPageView } from '@/components/alternative/roundup/RoundupPageView';
import { competitorData } from '@/lib/alternativeConfig';
import { buildBreadcrumbSchema } from '@/lib/breadcrumbs';
import { roundupData } from '@/lib/roundupConfig';

export function generateStaticParams() {
  const slugs = new Set([...Object.keys(competitorData), ...Object.keys(roundupData)]);
  return Array.from(slugs).map((slug) => ({ slug }));
}

interface AlternativeCompetitorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: AlternativeCompetitorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const roundup = roundupData[slug];
  const competitor = competitorData[slug];

  // Prefer the roundup SEO when this slug has been upgraded to a roundup page.
  const seo = roundup?.seo ?? competitor?.seo;

  if (!seo) {
    return {
      title: 'Not Found',
    };
  }

  const siteUrl = 'https://coderscreen.com';
  const pageUrl = `${siteUrl}/${slug}`;
  const ogAlt = roundup
    ? roundup.seo.title
    : competitor
      ? `CoderScreen vs ${competitor.displayName}`
      : 'CoderScreen';

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: pageUrl,
      siteName: 'CoderScreen',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: ogAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
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

  const roundup = roundupData[slug];
  const competitor = competitorData[slug];

  if (!roundup && !competitor) {
    notFound();
  }

  const breadcrumbLabel = roundup
    ? `${roundup.competitorName} Alternatives`
    : `${competitor?.displayName} Alternative`;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: breadcrumbLabel, href: `/${slug}` },
  ]);

  return (
    <>
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: needed for SEO schema
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {roundup ? (
        <RoundupPageView roundup={roundup} />
      ) : (
        competitor && <AlternativePageView competitor={competitor} />
      )}
    </>
  );
}
