import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Fox — AI Micro-Learning Platform',
  description: 'Master any skill in minutes a day with AI-powered micro-lessons delivered via Telegram.',
  keywords: ['AI learning', 'micro-learning', 'Telegram bot', 'education', 'personalized learning'],
  openGraph: {
    title: 'Fox — AI Micro-Learning',
    description: 'Master any skill in minutes a day with AI-powered micro-lessons.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
