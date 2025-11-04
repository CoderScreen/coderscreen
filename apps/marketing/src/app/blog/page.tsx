import Link from 'next/link';
import { getBlogPosts } from '@/lib/blog';
import dayjs from 'dayjs';

export const metadata = {
  title: 'Blog - CoderScreen',
  description: 'Read our latest articles about coding interviews, technical assessments, and engineering best practices.',
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Blog</h1>
        <p className="text-xl text-gray-600 mb-12">
          Insights on coding interviews, technical assessments, and engineering best practices.
        </p>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="border-b border-gray-200 pb-8 last:border-b-0"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block hover:opacity-80 transition-opacity"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <time dateTime={post.date}>
                      {dayjs(post.date).format('MMMM D, YYYY')}
                    </time>
                    {post.author && (
                      <>
                        <span>•</span>
                        <span>{post.author}</span>
                      </>
                    )}
                  </div>
                  {post.description && (
                    <p className="text-gray-700 text-lg leading-relaxed mb-3">
                      {post.description}
                    </p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
