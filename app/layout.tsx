import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '3D Visual — Silicon photonics, made visible',
  description: 'An interactive journey from a co-packaged optics assembly to silicon waveguides, microrings, WDM, and germanium photodetectors.',
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
