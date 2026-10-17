import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const changelogDirectory = path.join(process.cwd(), 'content/changelog');

export type ChangelogTag = 'New' | 'Improved' | 'Fixed';

export interface ChangelogEntry {
  slug: string;
  title: string;
  date: string;
  summary?: string;
  tags: ChangelogTag[];
  image?: string;
  content: string;
}

// Each entry is a file named `YYYY-MM-DD-some-slug.mdx`. The slug doubles as
// the anchor id on /changelog, so links like /changelog#<slug> stay stable.
export function getChangelogEntries(): ChangelogEntry[] {
  if (!fs.existsSync(changelogDirectory)) {
    return [];
  }

  const entries = fs
    .readdirSync(changelogDirectory)
    .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, '');
      const fileContents = fs.readFileSync(path.join(changelogDirectory, fileName), 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        date: data.date || slug.slice(0, 10),
        summary: data.summary,
        tags: data.tags || [],
        image: data.image,
        content,
      };
    });

  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
