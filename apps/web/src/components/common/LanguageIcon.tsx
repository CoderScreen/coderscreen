import { RoomSchema } from '@coderscreen/api/schema/room';
import BashPlain from 'devicons-react/icons/BashPlain';
import CPlain from 'devicons-react/icons/CPlain';
import CplusplusPlain from 'devicons-react/icons/CplusplusPlain';
import GoPlain from 'devicons-react/icons/GoPlain';
import JavaPlain from 'devicons-react/icons/JavaPlain';
import JavascriptPlain from 'devicons-react/icons/JavascriptPlain';
import PhpPlain from 'devicons-react/icons/PhpPlain';
import PythonPlain from 'devicons-react/icons/PythonPlain';
import RubyPlain from 'devicons-react/icons/RubyPlain';
import RustOriginal from 'devicons-react/icons/RustOriginal';
import TypescriptPlain from 'devicons-react/icons/TypescriptPlain';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const BASE_ICON_STYLE = 'h-4 w-4';

export const LanguageIcon = ({
  language,
  className,
}: {
  language: RoomSchema['language'];
  className?: string;
}) => {
  const iconStyle = useMemo(() => cn(BASE_ICON_STYLE, className), [className]);

  // anything that is not plain or line needs to be manually set to gray through opacity
  const icon = (() => {
    switch (language) {
      case 'javascript':
        return <JavascriptPlain className={iconStyle} />;
      case 'typescript':
        return <TypescriptPlain className={iconStyle} />;
      case 'python':
        return <PythonPlain className={iconStyle} />;
      case 'rust':
        // need to manually set the color to gray
        return <RustOriginal className={iconStyle} />;
      case 'c++':
        return <CplusplusPlain className={iconStyle} />;
      case 'c':
        return <CPlain className={iconStyle} />;
      case 'java':
        return <JavaPlain className={iconStyle} />;
      case 'go':
        return <GoPlain className={iconStyle} />;
      case 'php':
        return <PhpPlain className={iconStyle} />;
      case 'ruby':
        return <RubyPlain className={iconStyle} />;
      case 'bash':
        return <BashPlain className={iconStyle} />;
      default:
        return <div className={cn(iconStyle, 'bg-gray-200')} />;
    }
  })();

  return <div className='flex items-center bg-gray-100 rounded-md p-0.5'>{icon}</div>;
};
