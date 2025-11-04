import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const blogDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description?: string;
  author?: string;
  tags?: string[];
  content: string;
  image?: string;
  updatedAt?: string;
}

export interface BlogPostMetadata {
  slug: string;
  title: string;
  date: string;
  description?: string;
  author?: string;
  tags?: string[];
  image?: string;
  updatedAt?: string;
}

export function getBlogPosts(): BlogPostMetadata[] {
  // Check if blog directory exists
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(blogDirectory);
  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, '');
      const fullPath = path.join(blogDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        date: data.date || new Date().toISOString(),
        description: data.description,
        author: data.author,
        tags: data.tags,
        image: data.image,
        updatedAt: data.updatedAt,
      };
    });

  // Sort posts by date (newest first)
  return posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export function getBlogPost(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(blogDirectory, `${slug}.mdx`);
    let fileContents: string;

    if (fs.existsSync(fullPath)) {
      fileContents = fs.readFileSync(fullPath, 'utf8');
    } else {
      // Try .md extension if .mdx doesn't exist
      const mdPath = path.join(blogDirectory, `${slug}.md`);
      if (fs.existsSync(mdPath)) {
        fileContents = fs.readFileSync(mdPath, 'utf8');
      } else {
        return null;
      }
    }

    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || slug,
      date: data.date || new Date().toISOString(),
      description: data.description,
      author: data.author,
      tags: data.tags,
      content,
      image: data.image,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

export function getAllBlogSlugs(): string[] {
  // Check if blog directory exists
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(blogDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map((fileName) => fileName.replace(/\.mdx?$/, ''));
}
