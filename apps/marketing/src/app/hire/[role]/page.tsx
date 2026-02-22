import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { UseCasePageView } from '@/components/usecase/UseCasePageView';
import { buildBreadcrumbSchema } from '@/lib/breadcrumbs';
import { roleData } from '@/lib/roleConfig';

export function generateStaticParams() {
  return Object.keys(roleData).map((key) => ({
    role: key,
  }));
}

interface RolePageProps {
  params: Promise<{ role: string }>;
}

export async function generateMetadata({ params }: RolePageProps): Promise<Metadata> {
  const { role } = await params;
  const data = roleData[role];

  if (!data) {
    return {
      title: 'Not Found',
    };
  }

  const siteUrl = 'https://coderscreen.com';
  const pageUrl = `${siteUrl}/hire/${role}`;

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

export default async function RolePage({ params }: RolePageProps) {
  const { role } = await params;

  const data = roleData[role];
  if (!data) {
    notFound();
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: `Hire ${data.displayName}`, href: `/hire/${role}` },
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
