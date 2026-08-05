import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '',
  description: '',
  openGraph: {
    title: '',
    description: '',
    siteName: '',
  },
  twitter: {
    title: '',
    description: '',
    card: 'summary',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
