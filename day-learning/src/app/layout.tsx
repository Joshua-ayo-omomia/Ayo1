import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Day Learning | Become AI-native',
    template: '%s | Day Learning',
  },
  description:
    'Learn AI. Build things. Get hired. Day Learning is THCO\'s AI upskilling platform for people who already know how to build.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://daylearning.io'),
  openGraph: {
    title: 'Day Learning | Become AI-native',
    description: 'Learn AI. Build things. Get hired.',
    siteName: 'Day Learning',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Day Learning | Become AI-native',
    description: 'Learn AI. Build things. Get hired.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
