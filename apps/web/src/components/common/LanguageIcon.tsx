import BashPlain from 'devicons-react/icons/BashPlain';
import CPlain from 'devicons-react/icons/CPlain';
import CplusplusPlain from 'devicons-react/icons/CplusplusPlain';
import Css3Plain from 'devicons-react/icons/Css3Plain';
import GoPlain from 'devicons-react/icons/GoPlain';
import Html5Plain from 'devicons-react/icons/Html5Plain';
import JavaPlain from 'devicons-react/icons/JavaPlain';
import JavascriptOriginal from 'devicons-react/icons/JavascriptOriginal';
import MarkdownOriginal from 'devicons-react/icons/MarkdownOriginal';
import NextjsPlain from 'devicons-react/icons/NextjsPlain';
import PhpPlain from 'devicons-react/icons/PhpPlain';
import PythonPlain from 'devicons-react/icons/PythonPlain';
import ReactPlain from 'devicons-react/icons/ReactOriginal';
import RubyPlain from 'devicons-react/icons/RubyPlain';
import RustOriginal from 'devicons-react/icons/RustOriginal';
import SolidjsPlain from 'devicons-react/icons/SolidjsPlain';
import SveltePlain from 'devicons-react/icons/SveltePlain';
import TypescriptPlain from 'devicons-react/icons/TypescriptPlain';
import VueOriginal from 'devicons-react/icons/VuejsOriginal';
import { useMemo } from 'react';
import { cn, cx } from '@/lib/utils';
import type { FileType } from '@/query/realtime/editor.query';

const BASE_ICON_STYLE = '';

export const LanguageIcon = ({
  language,
  className,
}: {
  language: string | FileType;
  className?: string;
}) => {
  const iconStyle = useMemo(() => cn(BASE_ICON_STYLE, className), [className]);

  // anything that is not plain or line needs to be manually set to gray through opacity
  const icon = (() => {
    switch (language) {
      case 'javascript':
        return <JavascriptOriginal className={iconStyle} />;
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
      case 'react':
        return <ReactPlain className={iconStyle} />;
      case 'vue':
        return <VueOriginal className={iconStyle} />;
      case 'nextjs':
        return <NextjsPlain className={iconStyle} />;
      case 'svelte':
        return <SveltePlain className={iconStyle} />;
      case 'solidjs':
        return <SolidjsPlain className={iconStyle} />;
      case 'css':
        return <Css3Plain className={iconStyle} />;
      case 'html':
        return <Html5Plain className={iconStyle} />;
      case 'json':
        return <div className={cx(iconStyle, 'text-amber-600')}>{`{ }`}</div>;
      case 'markdown':
        return <MarkdownOriginal className={iconStyle} />;
      case 'jsx':
        return <ReactPlain className={iconStyle} />; // JSX uses React icon
      case 'tsx':
        return <TypescriptPlain className={iconStyle} />; // TSX uses TypeScript icon
      case 'unknown':
        return <div className={cn(iconStyle, 'bg-gray-200')} />;
      default:
        return <div className={cn(iconStyle, 'bg-gray-200')} />;
    }
  })();

  return <div className='flex items-center bg-gray-100 rounded-md p-0.5 h-4 w-4'>{icon}</div>;
};
