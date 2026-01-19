import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ComparePageView } from '@/components/compare/ComparePageView';
import { comparisonData } from '@/lib/comparisonConfig';

export function generateStaticParams() {
  return Object.keys(comparisonData).map((key) => ({
    slug: key,
  }));
}

interface ComparePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { slug } = await params;
  const comparison = comparisonData[slug];

  if (!comparison) {
    return {
      title: 'Not Found',
    };
  }

  const siteUrl = 'https://coderscreen.com';
  const pageUrl = `${siteUrl}/compare/${slug}`;

  return {
    title: comparison.seo.title,
    description: comparison.seo.description,
    keywords: comparison.seo.keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: comparison.seo.title,
      description: comparison.seo.description,
      url: pageUrl,
      siteName: 'CoderScreen',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${comparison.toolA.displayName} vs ${comparison.toolB.displayName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: comparison.seo.title,
      description: comparison.seo.description,
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

export default async function ComparePage({ params }: ComparePageProps) {
  const { slug } = await params;

  const comparison = comparisonData[slug];
  if (!comparison) {
    notFound();
  }

  return <ComparePageView comparison={comparison} />;
}
