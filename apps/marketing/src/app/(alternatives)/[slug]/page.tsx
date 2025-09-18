import { notFound } from 'next/navigation';
import { AlternativePageView } from '@/components/alternative/AlternativePageView';
import { competitorData } from '@/lib/alternativeConfig';

export function generateStaticParams() {
  return Object.keys(competitorData).map((key) => ({
    slug: key,
  }));
}

interface AlternativeCompetitorPageProps {
  params: {
    slug: string;
  };
}

export default function AlternativeCompetitorPage({ params }: AlternativeCompetitorPageProps) {
  const competitor = competitorData[params.slug];
  if (!competitor) {
    notFound();
  }

  return <AlternativePageView competitor={competitor} />;
}
