import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Barbados Licensing Authority | BLA Portal",
    template: "%s | BLA Portal",
  },
  description: "Official online portal for the Barbados Licensing Authority. Apply for learner's permits, driver's licences, renewals, and track your application status.",
  keywords: [
    "Barbados",
    "driver licence",
    "learner permit",
    "driving test",
    "licence renewal",
    "BLA",
    "Licensing Authority",
  ],
  authors: [{ name: "Barbados Licensing Authority" }],
  creator: "Barbados Licensing Authority",
  publisher: "Government of Barbados",
  metadataBase: new URL("https://bla.gov.bb"),
  openGraph: {
    type: "website",
    locale: "en_BB",
    url: "https://bla.gov.bb",
    siteName: "BLA Portal",
    title: "Barbados Licensing Authority | BLA Portal",
    description: "Official online portal for the Barbados Licensing Authority. Apply for learner's permits, driver's licences, and track your application status.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Barbados Licensing Authority Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Barbados Licensing Authority | BLA Portal",
    description: "Official online portal for the Barbados Licensing Authority",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a2540",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
