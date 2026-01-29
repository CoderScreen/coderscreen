import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import Link from 'next/link';

const YoutubeEmbed = ({ videoId }: { videoId: string }) => {
  return (
    <div className='aspect-video my-8'>
      <iframe
        className='aspect-video w-full rounded-lg'
        src={`https://www.youtube.com/embed/${videoId}`}
        title='YouTube Video Player'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
      ></iframe>
    </div>
  );
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h2 className='text-4xl font-bold mt-8 mb-4 text-gray-900'>{children}</h2>
    ),
    h2: ({ children }) => (
      <h2 className='text-3xl font-bold mt-6 mb-3 text-gray-900'>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className='text-2xl font-semibold mt-5 mb-2 text-gray-900'>{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className='text-xl font-semibold mt-4 mb-2 text-gray-900'>{children}</h4>
    ),
    p: ({ children }) => <p className='text-base leading-7 text-gray-700 mb-4'>{children}</p>,
    a: ({ href, children }) => (
      <Link href={href || '#'} className='text-blue-600 hover:text-blue-800 underline'>
        {children}
      </Link>
    ),
    ul: ({ children }) => <ul className='list-disc mb-4 space-y-2 text-gray-700'>{children}</ul>,
    ol: ({ children }) => <ol className='list-decimal mb-4 space-y-2 text-gray-700'>{children}</ol>,
    li: ({ children }) => <li className='ml-4'>{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className='border-l-4 border-gray-300 mb-4 italic text-gray-700'>
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className='rounded px-1.5 py-0.5 text-sm font-mono'>{children}</code>
    ),
    pre: ({ children }) => <pre className='bg-gray-900 rounded-lg overflow-x-auto'>{children}</pre>,
    img: ({ src, alt }) => {
      if (!src) return null;
      // Use Next.js Image for optimized loading
      return (
        <span className='block my-6'>
          <Image
            src={src}
            alt={alt || ''}
            width={800}
            height={450}
            className='rounded-lg max-w-full h-auto'
            loading='lazy'
            sizes='(max-width: 768px) 100vw, 800px'
          />
        </span>
      );
    },
    hr: () => <hr className='my-8 border-gray-300' />,
    table: ({ children }) => (
      <div className='overflow-x-auto mb-4'>
        <table className='min-w-full divide-y divide-gray-300'>{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className='px-4 py-2 text-left text-sm font-semibold text-gray-900 bg-gray-100'>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className='px-4 py-2 text-sm text-gray-700 border-t border-gray-200'>{children}</td>
    ),
    YoutubeEmbed,
    ...components,
  };
}
