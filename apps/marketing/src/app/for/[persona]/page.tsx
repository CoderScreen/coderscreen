import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { UseCasePageView } from '@/components/usecase/UseCasePageView';
import { buildBreadcrumbSchema } from '@/lib/breadcrumbs';
import { personaData } from '@/lib/personaConfig';

export function generateStaticParams() {
  return Object.keys(personaData).map((key) => ({
    persona: key,
  }));
}

interface PersonaPageProps {
  params: Promise<{ persona: string }>;
}

export async function generateMetadata({ params }: PersonaPageProps): Promise<Metadata> {
  const { persona } = await params;
  const data = personaData[persona];

  if (!data) {
    return {
      title: 'Not Found',
    };
  }

  const siteUrl = 'https://coderscreen.com';
  const pageUrl = `${siteUrl}/for/${persona}`;

  return {
    title: data.seo.title,
    description: data.seo.description,
    keywords: data.seo.keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: data.seo.title,
      description: data.seo.description,
      url: pageUrl,
      siteName: 'CoderScreen',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: data.hero.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.seo.title,
      description: data.seo.description,
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

export default async function PersonaPage({ params }: PersonaPageProps) {
  const { persona } = await params;

  const data = personaData[persona];
  if (!data) {
    notFound();
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: `For ${data.displayName}`, href: `/for/${persona}` },
  ]);

  return (
    <>
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: needed for SEO schema
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <UseCasePageView data={data} />
    </>
  );
}
