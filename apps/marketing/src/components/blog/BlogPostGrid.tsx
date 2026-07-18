'use client';

import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { BlogPostMetadata } from '@/lib/blog';

const PAGE_SIZE = 6;

export function BlogPostGrid({ posts }: { posts: BlogPostMetadata[] }) {
  const [visibleCount, setVisibleCount] = useState(() => Math.min(PAGE_SIZE, posts.length));
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = visibleCount < posts.length;
  const loadMore = () => setVisibleCount((count) => Math.min(count + PAGE_SIZE, posts.length));

  // Infinite scroll: reveal the next page as the sentinel nears the viewport.
  // Re-runs on visibleCount so it keeps loading while the sentinel stays in view.
  useEffect(() => {
    if (!hasMore || typeof IntersectionObserver === 'undefined') return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, visibleCount, posts.length]);

  return (
    <div className='border-t border-gray-200 pt-12'>
      <div className='grid gap-x-8 gap-y-12 sm:grid-cols-2'>
        {posts.slice(0, visibleCount).map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className='group block'>
            {post.image && (
              <div className='mb-4 aspect-[16/9] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100'>
                <Image
                  src={post.image}
                  alt={post.title}
                  width={800}
                  height={450}
                  className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]'
                />
              </div>
            )}
            <div className='mb-2 flex items-center gap-2 text-xs text-gray-500'>
              <time dateTime={post.date}>{dayjs(post.date).format('MMM D, YYYY')}</time>
              {post.author && (
                <>
                  <span aria-hidden='true'>·</span>
                  <span>{post.author}</span>
                </>
              )}
            </div>
            <h3 className='mb-2 line-clamp-2 text-lg font-semibold leading-snug text-gray-900 transition-colors group-hover:text-blue-600'>
              {post.title}
            </h3>
            {post.description && (
              <p className='line-clamp-2 text-sm leading-relaxed text-gray-600'>
                {post.description}
              </p>
            )}
          </Link>
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className='mt-14 flex justify-center'>
          <button
            type='button'
            onClick={loadMore}
            className='rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50'
          >
            Load more articles
          </button>
        </div>
      )}
    </div>
  );
}
