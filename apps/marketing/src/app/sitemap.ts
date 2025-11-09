import { MetadataRoute } from 'next';
import { getBlogPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://coderscreen.com';

  // Base static URLs
  const staticUrls: MetadataRoute.Sitemap = [
    // Landing page
    {
      url: baseUrl,
      lastModified: '2025-10-01',
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // Alternative pages
    {
      url: `${baseUrl}/coderpad-alternative`,
      lastModified: '2025-10-01',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hackerrank-alternative`,
      lastModified: '2025-10-01',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/codesignal-alternative`,
      lastModified: '2025-10-01',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/coderbyte-alternative`,
      lastModified: '2025-10-01',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Blog listing page
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Dynamic blog post URLs
  const blogPosts = getBlogPosts();
  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticUrls, ...blogUrls];
}
