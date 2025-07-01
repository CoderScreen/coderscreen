import { cn } from '@/lib/utils';
import { RoomSchema } from '@coderscreen/api/schema/room';
import JavascriptPlain from 'devicons-react/icons/JavascriptPlain';
import TypescriptPlain from 'devicons-react/icons/TypescriptPlain';
import PythonPlain from 'devicons-react/icons/PythonPlain';
import RustOriginal from 'devicons-react/icons/RustOriginal';
import CPlusPlusPlain from 'devicons-react/icons/CPlusPlusPlain';

const iconStyle = 'h-4 w-4';

export const LanguageIcon = ({
  language,
}: {
  language: RoomSchema['language'];
}) => {
  // anything that is not plain or line needs to be manually set to gray through opacity
  const icon = (() => {
    switch (language) {
      case 'javascript':
        return <JavascriptPlain className={iconStyle} color='gray' />;
      case 'typescript':
        return <TypescriptPlain className={iconStyle} color='gray' />;
      case 'python':
        return <PythonPlain className={iconStyle} color='gray' />;
      case 'rust':
        // need to manually set the color to gray
        return <RustOriginal className={cn(iconStyle, 'opacity-50')} />;
      case 'c++':
        return <CPlusPlusPlain className={iconStyle} color='gray' />;
      default:
        return <div className={cn(iconStyle, 'bg-gray-200')} />;
    }
  })();

  return (
    <div className='flex items-center bg-gray-100 rounded-md p-0.5'>{icon}</div>
  );
};
