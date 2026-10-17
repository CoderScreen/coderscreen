import { RiArrowRightLine } from '@remixicon/react';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { ChangelogTagBadge } from '@/components/changelog/ChangelogTagBadge';
import { buildBreadcrumbSchema } from '@/lib/breadcrumbs';
import { getChangelogEntries } from '@/lib/changelog';

export const metadata = {
  title: 'Changelog - CoderScreen',
  description:
    'New features, improvements and fixes to CoderScreen, the open-source platform for live coding interviews and coding assessments.',
  alternates: {
    canonical: 'https://coderscreen.com/changelog',
  },
  openGraph: {
    url: 'https://coderscreen.com/changelog',
  },
};

export default function ChangelogPage() {
  const entries = getChangelogEntries();

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Changelog', href: '/changelog' },
  ]);

  return (
    <div className='min-h-screen bg-white'>
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: needed for SEO schema
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className='max-w-5xl mx-auto px-4 sm:px-6 py-16'>
        {/* Header */}
        <header className='mb-12 border-b border-gray-200 pb-8'>
          <h1 className='text-4xl sm:text-5xl font-bold tracking-tight text-gray-900'>Changelog</h1>
          <p className='mt-3 max-w-2xl text-lg text-gray-600'>
            What we&apos;ve shipped lately. New features, improvements and fixes to CoderScreen.
          </p>
          <Link
            href='/roadmap'
            className='group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600'
          >
            See what we&apos;re working on next
            <RiArrowRightLine className='size-4 transition-transform group-hover:translate-x-0.5' />
          </Link>
        </header>

        {entries.length === 0 ? (
          <div className='py-16 text-center'>
            <p className='text-lg text-gray-500'>Nothing here yet. Check back soon.</p>
          </div>
        ) : (
          <div className='divide-y divide-gray-200'>
            {entries.map((entry) => (
              <article
                key={entry.slug}
                id={entry.slug}
                className='grid scroll-mt-24 gap-4 py-12 first:pt-0 md:grid-cols-[12rem_1fr] md:gap-10'
              >
                {/* Date + tags */}
                <div className='md:sticky md:top-24 md:self-start'>
                  <a
                    href={`#${entry.slug}`}
                    className='text-sm font-medium text-gray-500 hover:text-gray-900'
                  >
                    <time dateTime={entry.date}>{dayjs(entry.date).format('MMMM D, YYYY')}</time>
                  </a>
                  {entry.tags.length > 0 && (
                    <div className='mt-2 flex flex-wrap gap-1.5'>
                      {entry.tags.map((tag) => (
                        <ChangelogTagBadge key={tag} tag={tag} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className='min-w-0'>
                  <h2 className='text-2xl font-bold tracking-tight text-gray-900'>{entry.title}</h2>
                  {entry.image && (
                    <div className='mt-6 overflow-hidden rounded-xl border border-gray-200 bg-gray-100'>
                      <Image
                        src={entry.image}
                        alt={entry.title}
                        width={1200}
                        height={675}
                        className='h-auto w-full'
                      />
                    </div>
                  )}
                  <div className='prose prose-gray mt-4 max-w-none prose-a:text-blue-600 prose-code:before:content-none prose-code:after:content-none'>
                    <MDXRemote
                      source={entry.content}
                      options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
