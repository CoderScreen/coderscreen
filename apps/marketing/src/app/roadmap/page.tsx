import { RiArrowRightLine, RiGithubLine, RiMailLine } from '@remixicon/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { ChangelogTagBadge } from '@/components/changelog/ChangelogTagBadge';
import { buildBreadcrumbSchema } from '@/lib/breadcrumbs';
import { getChangelogEntries } from '@/lib/changelog';
import {
  type RoadmapStatus,
  roadmapColumns,
  roadmapItems,
  roadmapUpdatedAt,
} from '@/lib/roadmapConfig';
import { siteConfig } from '@/lib/siteConfig';
import { cx } from '@/lib/utils';

export const metadata = {
  title: 'Roadmap - CoderScreen',
  description:
    "What we're building next for CoderScreen: upcoming features for live coding interviews, coding assessments and integrations.",
  alternates: {
    canonical: 'https://coderscreen.com/roadmap',
  },
  openGraph: {
    url: 'https://coderscreen.com/roadmap',
  },
};

const STATUS_DOT: Record<RoadmapStatus, string> = {
  now: 'bg-blue-600',
  next: 'bg-gray-400',
  later: 'bg-gray-200',
};

export default function RoadmapPage() {
  const recentlyShipped = getChangelogEntries().slice(0, 4);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Roadmap', href: '/roadmap' },
  ]);

  return (
    <div className='min-h-screen bg-white'>
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: needed for SEO schema
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-16'>
        {/* Header */}
        <header className='mb-12 border-b border-gray-200 pb-8'>
          <h1 className='text-4xl sm:text-5xl font-bold tracking-tight text-gray-900'>Roadmap</h1>
          <p className='mt-3 max-w-2xl text-lg text-gray-600'>
            What we&apos;re working on and what&apos;s coming up. Plans change as we hear from teams
            using CoderScreen, so treat this as direction, not a promise.
          </p>
          <p className='mt-4 text-sm text-gray-500'>
            Last updated{' '}
            <time dateTime={roadmapUpdatedAt}>
              {dayjs(roadmapUpdatedAt).format('MMMM D, YYYY')}
            </time>
          </p>
        </header>

        {/* Now / Next / Later */}
        <div className='grid gap-8 md:grid-cols-3'>
          {roadmapColumns.map((column) => {
            const items = roadmapItems.filter((item) => item.status === column.status);

            return (
              <section key={column.status}>
                <div className='mb-4'>
                  <h2 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
                    <span className={cx('size-2 rounded-full', STATUS_DOT[column.status])} />
                    {column.title}
                    <span className='text-sm font-normal text-gray-400'>{items.length}</span>
                  </h2>
                  <p className='mt-1 text-sm text-gray-500'>{column.description}</p>
                </div>

                <ul className='space-y-3'>
                  {items.map((item) => (
                    <li
                      key={item.title}
                      className='rounded-lg border border-gray-200 bg-white p-4 shadow-xs'
                    >
                      <span className='text-xs font-medium text-gray-500'>{item.area}</span>
                      <h3 className='mt-1 font-semibold text-gray-900'>{item.title}</h3>
                      <p className='mt-1.5 text-sm leading-relaxed text-gray-600'>
                        {item.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Recently shipped */}
        {recentlyShipped.length > 0 && (
          <section className='mt-20'>
            <div className='mb-6 flex items-end justify-between gap-4'>
              <h2 className='text-2xl font-bold tracking-tight text-gray-900'>Recently shipped</h2>
              <Link
                href='/changelog'
                className='group inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600'
              >
                Full changelog
                <RiArrowRightLine className='size-4 transition-transform group-hover:translate-x-0.5' />
              </Link>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              {recentlyShipped.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/changelog#${entry.slug}`}
                  className='block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50'
                >
                  <div className='flex flex-wrap items-center gap-2'>
                    <time dateTime={entry.date} className='text-xs text-gray-500'>
                      {dayjs(entry.date).format('MMMM D, YYYY')}
                    </time>
                    {entry.tags.map((tag) => (
                      <ChangelogTagBadge key={tag} tag={tag} />
                    ))}
                  </div>
                  <h3 className='mt-2 font-semibold text-gray-900'>{entry.title}</h3>
                  {entry.summary && (
                    <p className='mt-1 text-sm text-gray-600 line-clamp-2'>{entry.summary}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Requests */}
        <section className='mt-20 rounded-xl border border-gray-200 bg-gray-50 p-8'>
          <h2 className='text-xl font-bold text-gray-900'>Missing something?</h2>
          <p className='mt-2 max-w-2xl text-gray-600'>
            Most of this list came from teams telling us what got in their way. If something you
            need isn&apos;t here, open an issue on GitHub or email us.
          </p>
          <div className='mt-5 flex flex-wrap gap-x-6 gap-y-3'>
            <a
              href={`${siteConfig.external.githubRepo}/issues/new`}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600'
            >
              <RiGithubLine className='size-4' aria-hidden='true' />
              Open a GitHub issue
            </a>
            <a
              href={siteConfig.external.featureRequest}
              className='inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600'
            >
              <RiMailLine className='size-4' aria-hidden='true' />
              Email a feature request
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
