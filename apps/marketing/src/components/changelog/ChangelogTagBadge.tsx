import type { ChangelogTag } from '@/lib/changelog';
import { cx } from '@/lib/utils';

const TAG_STYLES: Record<ChangelogTag, string> = {
  New: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Improved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Fixed: 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

export function ChangelogTagBadge({ tag }: { tag: ChangelogTag }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        TAG_STYLES[tag] ?? 'bg-gray-50 text-gray-700 ring-gray-500/20'
      )}
    >
      {tag}
    </span>
  );
}
