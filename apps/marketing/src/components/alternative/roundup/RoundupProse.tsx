import { cx } from '@/lib/utils';

interface RoundupProseProps {
  title: string;
  paragraphs: string[];
  muted?: boolean; // used for the methodology / transparency note
}

export const RoundupProse = ({ title, paragraphs, muted = false }: RoundupProseProps) => {
  return (
    <section className='border-t px-6 py-20'>
      <div className='max-w-3xl mx-auto'>
        <h2 className={cx('font-semibold mb-4', muted ? 'text-lg text-foreground' : 'text-3xl')}>
          {title}
        </h2>
        <div className='space-y-4'>
          {paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className={cx(
                'leading-relaxed text-muted-foreground',
                muted ? 'text-sm' : 'text-base'
              )}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};
