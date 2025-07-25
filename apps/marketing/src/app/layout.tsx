import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { MarketingHeader } from '@/components/common/MarketingHeader';
import { MarketingFooter } from '@/components/common/MarketingFooter';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CoderScreen - Fast, Modern Technical Interviews',
  description:
    'CoderScreen is a fast, collaborative coding interview platform for teams that care about developer experience. Run live interviews, take-homes, and technical assessments with ease.',
  metadataBase: new URL('https://coderscreen.com'),
  openGraph: {
    title: 'CoderScreen - Fast, Modern Technical Interviews',
    description:
      'Run live coding interviews, take-homes, and assessments with a collaborative editor, whiteboard, and AI assistant. Built for developer-first hiring.',
    url: 'https://coderscreen.com',
    siteName: 'CoderScreen',
    images: [
      {
        url: 'https://coderscreen.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CoderScreen - Technical Interview Platform',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoderScreen',
    description:
      'Collaborative coding interviews that feel like real development. Try CoderScreen for free.',
    images: ['https://coderscreen.com/og-image.png'],
  },
  keywords: [
    'technical interviews',
    'coding interview platform',
    'developer hiring',
    'collaborative code editor',
    'live coding',
    'take-home assessments',
    'AI coding assistant',
    'interview playback',
    'CoderScreen',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.className} ${geistMono.variable} antialiased`}>
        <MarketingHeader />
        {children}
        <MarketingFooter />
      </body>
    </html>
  );
}
