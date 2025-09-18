import { notFound } from 'next/navigation';
import { AlternativePageView } from '@/components/alternative/AlternativePageView';
import { competitorData } from '@/lib/alternativeConfig';

export function generateStaticParams() {
  return Object.keys(competitorData).map((key) => ({
    slug: key,
  }));
}

interface AlternativeCompetitorPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AlternativeCompetitorPage({
  params,
}: AlternativeCompetitorPageProps) {
  const { slug } = await params;

  const competitor = competitorData[slug];
  if (!competitor) {
    notFound();
  }

  return <AlternativePageView competitor={competitor} />;
}
