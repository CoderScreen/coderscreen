import { Logo } from '@/components/common/Logo';
import type { ToolProfile } from '@/lib/toolsDatabase';
import { cx } from '@/lib/utils';

interface ToolLogoProps {
  tool: ToolProfile;
  className?: string;
}

// A consistent square tile for every tool mark. CoderScreen renders the brand
// SVG (its own blue); competitors render their downloaded logo, contained.
export const ToolLogo = ({ tool, className }: ToolLogoProps) => {
  return (
    <div
      className={cx(
        'flex items-center justify-center shrink-0 border bg-white overflow-hidden',
        className
      )}
    >
      {tool.isUs ? (
        <Logo className='h-1/2 w-auto text-primary' />
      ) : tool.logo ? (
        <img
          src={tool.logo}
          alt={`${tool.name} logo`}
          className='h-3/4 w-3/4 object-contain'
          loading='lazy'
        />
      ) : (
        <span className='text-sm font-semibold text-gray-500'>{tool.name.charAt(0)}</span>
      )}
    </div>
  );
};
