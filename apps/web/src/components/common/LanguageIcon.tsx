import { cn } from '@/lib/utils';
import { RoomSchema } from '@coderscreen/api/schema/room';
import TypescriptPlain from 'devicons-react/icons/TypescriptPlain';

const iconStyle = 'h-4 w-4';

export const LanguageIcon = ({
  language,
}: {
  language: RoomSchema['language'];
}) => {
  switch (language) {
    case 'typescript':
      return <TypescriptPlain className={iconStyle} />;
    default:
      return <div className={cn(iconStyle, 'bg-gray-200')} />;
  }
};
