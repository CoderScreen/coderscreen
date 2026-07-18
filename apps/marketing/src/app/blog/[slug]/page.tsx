import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { useMDXComponents } from '@/components/blog/MDXComponents';
import { getAllBlogSlugs, getBlogPost, getRelatedPosts } from '@/lib/blog';
import { buildBreadcrumbSchema } from '@/lib/breadcrumbs';
import 'highlight.js/styles/github-dark.css';

const AUTHOR_AVATARS: Record<string, string> = {
  'Kuba Rogut': '/blog/author/kuba_rogut.png',
};

function AuthorAvatar({ name }: { name: string }) {
  const avatar = AUTHOR_AVATARS[name];

  if (avatar) {
    return (
      <Image
        src={avatar}
        alt={name}
        width={44}
        height={44}
        className='h-11 w-11 flex-shrink-0 rounded-full object-cover'
      />
    );
  }

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <span className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white'>
      {initials}
    </span>
  );
}

function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function RelatedArticles({ slug, tags }: { slug: string; tags?: string[] }) {
  const related = getRelatedPosts(slug, tags, 3);

  if (related.length === 0) {
    return null;
  }

  return (
    <section className='max-w-4xl mx-auto px-4 pb-16'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>Related Articles</h2>
      <div className='grid md:grid-cols-3 gap-6'>
        {related.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className='block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
          >
            <h3 className='font-semibold text-gray-900 mb-2 line-clamp-2'>{post.title}</h3>
            {post.description && (
              <p className='text-sm text-gray-600 line-clamp-3'>{post.description}</p>
            )}
            <time className='block text-xs text-gray-400 mt-3' dateTime={post.date}>
              {dayjs(post.date).format('MMMM D, YYYY')}
            </time>
          </Link>
        ))}
      </div>
    </section>
  );
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coderscreen.com';
  const postUrl = `${siteUrl}/blog/${slug}`;
  // Use the post's thumbnail as the OpenGraph/Twitter image (absolute URL for scrapers).
  const imageUrl = post.image
    ? post.image.startsWith('http')
      ? post.image
      : `${siteUrl}${post.image}`
    : `${siteUrl}/og-image.png`;

  // Generate keywords from tags and extract key terms from title
  const keywords = [
    ...(post.tags || []),
    'CoderScreen',
    'technical interviews',
    'coding assessments',
    'software engineering',
    'developer hiring',
  ].join(', ');

  return {
    title: `${post.title} | CoderScreen`,
    description: post.description || post.title,
    keywords,
    authors: [{ name: post.author || 'Kuba Rogut' }],
    creator: post.author || 'Kuba Rogut',
    publisher: 'CoderScreen',

    // Open Graph metadata for social sharing
    openGraph: {
      type: 'article',
      url: postUrl,
      title: post.title,
      description: post.description || post.title,
      siteName: 'CoderScreen Blog',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.date,
      modifiedTime: post.updatedAt || post.date,
      authors: [post.author || 'Kuba Rogut'],
      tags: post.tags || [],
    },

    // Twitter Card metadata
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description || post.title,
      images: [imageUrl],
      creator: '@CoderScreen',
      site: '@CoderScreen',
    },

    // Canonical URL
    alternates: {
      canonical: postUrl,
    },

    // Additional metadata
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

    // Article metadata
    other: {
      'article:published_time': post.date,
      'article:modified_time': post.updatedAt || post.date,
      'article:author': post.author || 'Kuba Rogut',
      'article:section': 'Technology',
      'article:tag': post.tags?.join(', ') || '',
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coderscreen.com';
  const postUrl = `${siteUrl}/blog/${slug}`;
  // Use the post's thumbnail as the OpenGraph/Twitter image (absolute URL for scrapers).
  const imageUrl = post.image
    ? post.image.startsWith('http')
      ? post.image
      : `${siteUrl}${post.image}`
    : `${siteUrl}/og-image.png`;
  const author = post.author || 'Kuba Rogut';
  const readingTime = getReadingTime(post.content);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: post.title, href: `/blog/${slug}` },
  ]);

  const blogPostSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description || post.title,
    image: imageUrl,
    datePublished: post.date,
    dateModified: post.updatedAt || post.date,
    author: {
      '@type': 'Person',
      name: post.author || 'Kuba Rogut',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CoderScreen',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: post.tags?.join(', '),
  };

  return (
    <div className='min-h-screen bg-white'>
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: needed for SEO schema
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
      />
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: needed for SEO schema
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <article className='max-w-4xl mx-auto px-4 py-16'>
        <Link
          href='/blog'
          className='inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors'
        >
          <svg
            className='w-4 h-4 mr-2'
            aria-hidden='true'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
          Back to Blog
        </Link>

        <header className='mb-10'>
          <h1 className='text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-gray-900'>
            {post.title}
          </h1>
          {post.description && (
            <p className='mt-5 text-xl leading-8 text-gray-600'>{post.description}</p>
          )}
          <div className='mt-8 flex items-center gap-3'>
            <AuthorAvatar name={author} />
            <div className='text-sm'>
              <p className='font-semibold text-gray-900'>{author}</p>
              <div className='flex items-center gap-2 text-gray-500'>
                <time dateTime={post.date}>{dayjs(post.date).format('MMMM D, YYYY')}</time>
                <span aria-hidden='true'>·</span>
                <span>{readingTime} min read</span>
              </div>
            </div>
          </div>
        </header>

        <div className='prose prose-lg max-w-none'>
          <MDXRemote
            source={post.content}
            components={useMDXComponents({})}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeHighlight],
              },
            }}
          />
        </div>

        {post.tags && post.tags.length > 0 && (
          <footer className='mt-12 border-t border-gray-200 pt-8'>
            <h2 className='mb-3 text-sm font-semibold text-gray-900'>Topics</h2>
            <div className='flex flex-wrap gap-2'>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className='inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600'
                >
                  {tag}
                </span>
              ))}
            </div>
          </footer>
        )}
      </article>

      <RelatedArticles slug={slug} tags={post.tags} />
    </div>
  );
}
