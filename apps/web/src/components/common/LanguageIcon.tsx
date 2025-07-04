import { cn } from '@/lib/utils';
import { RoomSchema } from '@coderscreen/api/schema/room';
import JavascriptPlain from 'devicons-react/icons/JavascriptPlain';
import TypescriptPlain from 'devicons-react/icons/TypescriptPlain';
import PythonPlain from 'devicons-react/icons/PythonPlain';
import RustOriginal from 'devicons-react/icons/RustOriginal';
import CPlusPlusPlain from 'devicons-react/icons/CPlusPlusPlain';
import CPlain from 'devicons-react/icons/CPlain';
import GoPlain from 'devicons-react/icons/GoPlain';
import JavaPlain from 'devicons-react/icons/JavaPlain';
import PhpPlain from 'devicons-react/icons/PhpPlain';
import RubyPlain from 'devicons-react/icons/RubyPlain';
import BashPlain from 'devicons-react/icons/BashPlain';

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
        return <JavascriptPlain className={iconStyle} />;
      case 'typescript':
        return <TypescriptPlain className={iconStyle} />;
      case 'python':
        return <PythonPlain className={iconStyle} />;
      case 'rust':
        // need to manually set the color to gray
        return <RustOriginal className={iconStyle} />;
      case 'c++':
        return <CPlusPlusPlain className={iconStyle} />;
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

  return (
    <div className='flex items-center bg-gray-100 rounded-md p-0.5'>{icon}</div>
  );
};
