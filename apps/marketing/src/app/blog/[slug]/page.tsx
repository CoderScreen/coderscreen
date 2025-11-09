import dayjs from 'dayjs';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { useMDXComponents } from '@/components/blog/MDXComponents';
import { getAllBlogSlugs, getBlogPost } from '@/lib/blog';
import 'highlight.js/styles/github-dark.css';

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
  const imageUrl = post.image || `${siteUrl}/og-image.png`;

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
    title: `${post.title} - CoderScreen Blog`,
    description: post.description || post.title,
    keywords,
    authors: [{ name: post.author || 'CoderScreen Team' }],
    creator: post.author || 'CoderScreen Team',
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
      authors: [post.author || 'CoderScreen Team'],
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
      'article:author': post.author || 'CoderScreen Team',
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

  return (
    <div className='min-h-screen bg-white'>
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

        <header className='mb-8'>
          <h1 className='text-5xl font-bold text-gray-900 mb-4'>{post.title}</h1>
          <div className='flex items-center gap-4 text-gray-600'>
            <time dateTime={post.date}>{dayjs(post.date).format('MMMM D, YYYY')}</time>
            {post.author && (
              <>
                <span>•</span>
                <span>{post.author}</span>
              </>
            )}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className='flex flex-wrap gap-2 mt-4'>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className='inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {post.image && (
          <div className='mb-12 overflow-hidden rounded-lg'>
            <Image
              src={post.image}
              alt={post.title}
              width={1200}
              height={630}
              className='w-full h-auto object-cover'
              priority
            />
          </div>
        )}

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
      </article>
    </div>
  );
}
