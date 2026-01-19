import { MetadataRoute } from 'next';
import { getBlogPosts } from '@/lib/blog';
import { competitorData } from '@/lib/alternativeConfig';
import { comparisonData } from '@/lib/comparisonConfig';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://coderscreen.com';
  const today = new Date().toISOString().split('T')[0];

  // Base static URLs
  const staticUrls: MetadataRoute.Sitemap = [
    // Landing page
    {
      url: baseUrl,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // Blog listing page
    {
      url: `${baseUrl}/blog`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Alternative pages (dynamic from config)
  const alternativeUrls: MetadataRoute.Sitemap = Object.values(competitorData).map(
    (competitor) => ({
      url: `${baseUrl}/${competitor.slug}`,
      lastModified: today,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })
  );

  // Comparison pages (dynamic from config)
  const comparisonUrls: MetadataRoute.Sitemap = Object.values(comparisonData).map(
    (comparison) => ({
      url: `${baseUrl}/compare/${comparison.slug}`,
      lastModified: today,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })
  );

  // Dynamic blog post URLs
  const blogPosts = getBlogPosts();
  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticUrls, ...alternativeUrls, ...comparisonUrls, ...blogUrls];
}
