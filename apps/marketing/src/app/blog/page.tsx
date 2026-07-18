import { RiArrowRightLine } from '@remixicon/react';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPostGrid } from '@/components/blog/BlogPostGrid';
import { getBlogPosts } from '@/lib/blog';
import { buildBreadcrumbSchema } from '@/lib/breadcrumbs';

export const metadata = {
  title: 'Blog - CoderScreen',
  description:
    'Read our latest articles about coding interviews, technical assessments, and engineering best practices.',
  alternates: {
    canonical: 'https://coderscreen.com/blog',
  },
  openGraph: {
    url: 'https://coderscreen.com/blog',
  },
};

export default function BlogPage() {
  const posts = getBlogPosts();
  const [featured, ...rest] = posts;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
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
          <h1 className='text-4xl sm:text-5xl font-bold tracking-tight text-gray-900'>Blog</h1>
          <p className='mt-3 max-w-2xl text-lg text-gray-600'>
            Deep dives on how we build CoderScreen, plus what we&apos;re learning about coding
            interviews and technical hiring.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className='py-16 text-center'>
            <p className='text-lg text-gray-500'>No posts yet. Check back soon.</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} className='group mb-16 block'>
                {featured.image && (
                  <div className='mb-6 aspect-[2/1] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100'>
                    <Image
                      src={featured.image}
                      alt={featured.title}
                      width={1200}
                      height={600}
                      priority
                      className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
                    />
                  </div>
                )}
                <div className='mb-2 flex items-center gap-2 text-sm text-gray-500'>
                  <time dateTime={featured.date}>
                    {dayjs(featured.date).format('MMMM D, YYYY')}
                  </time>
                  {featured.author && (
                    <>
                      <span aria-hidden='true'>·</span>
                      <span>{featured.author}</span>
                    </>
                  )}
                </div>
                <h2 className='mb-3 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 transition-colors group-hover:text-blue-600'>
                  {featured.title}
                </h2>
                {featured.description && (
                  <p className='max-w-3xl text-lg leading-relaxed text-gray-600'>
                    {featured.description}
                  </p>
                )}
                <span className='mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600'>
                  Read article
                  <RiArrowRightLine className='size-4 transition-transform group-hover:translate-x-0.5' />
                </span>
              </Link>
            )}

            {/* More articles — infinite scroll + "Load more" fallback */}
            {rest.length > 0 && <BlogPostGrid posts={rest} />}
          </>
        )}
      </div>
    </div>
  );
}
