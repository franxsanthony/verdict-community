// Force rebuild
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from 'next/headers';
import ClientVersionManager from '@/components/ClientVersionManager';
import "./globals.css";
import Providers from "@/components/Providers";

import AchievementToast from "@/components/AchievementToast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://verdict.run'),
  title: "Verdict - The Ultimate Competitive Programming Platform",
  description:
    "Master algorithms with Verdict. Join a global community of competitive programmers, solve problems, and track your progress.",
  keywords: [
    "Verdict",
    "Verdict.run",
    "competitive programming",
    "coding",
    "algorithms",
    "Codeforces",
    "LeetCode",
  ],
  authors: [{ name: "Verdict Team" }],
  creator: "Verdict",
  publisher: "Verdict",
  openGraph: {
    title: "Verdict - The Ultimate Competitive Programming Platform",
    description:
      "Master algorithms with Verdict. Join a global community of competitive programmers.",
    url: "./",
    siteName: "Verdict",
    images: [
      {
        url: "/images/metadata.webp",
        width: 1200,
        height: 630,
        alt: "Verdict",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verdict",
    description: "The Ultimate Competitive Programming Platform",
    images: ["/images/metadata.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icons/logo.webp',
    shortcut: '/icons/logo.webp',
    apple: '/icons/logo.webp',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/icons/logo.webp',
    },
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: './',
    languages: {
      'en-US': 'https://verdict.run',
    },
  },
};

// Multiple JSON-LD schemas for rich snippets
const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://verdict.run/#organization',
  name: 'Verdict',
  url: 'https://verdict.run',
  logo: {
    '@type': 'ImageObject',
    url: 'https://verdict.run/icons/logo.webp',
    width: 512,
    height: 512,
  },
  image: 'https://verdict.run/images/metadata.webp',
  description: 'A modern competitive programming platform for mastering algorithms and data structures.',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@verdict.run',
    contactType: 'customer support',
    availableLanguage: ['English', 'Arabic']
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Damietta',
    addressCountry: 'EG'
  }
};

const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://verdict.run/#website',
  name: 'Verdict',
  url: 'https://verdict.run',
  publisher: { '@id': 'https://verdict.run/#organization' },
  inLanguage: ['en', 'ar'],
};

const jsonLdCourse = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Competitive Programming Training',
  description: 'Comprehensive training program to master algorithms and problem-solving.',
  provider: { '@id': 'https://verdict.run/#organization' },
  educationalLevel: 'Beginner to Advanced',
  teaches: ['C++', 'Algorithms', 'Data Structures', 'Problem Solving', 'Competitive Programming'],
  availableLanguage: ['en', 'ar'],
  isAccessibleForFree: true,
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'online',
    instructor: {
      '@type': 'Person',
      name: 'Verdict Team'
    }
  }
};

const jsonLdBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://verdict.run'
    }
  ]
};

const jsonLdSoftwareApp = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Verdict',
  operatingSystem: 'Any',
  applicationCategory: 'EducationalApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '150'
  }
};

const allJsonLd = [jsonLdOrganization, jsonLdWebsite, jsonLdCourse, jsonLdBreadcrumb, jsonLdSoftwareApp];

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#10B981",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialToken = cookieStore.get('authToken')?.value;

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* KaTeX for Fast Math Rendering */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          crossOrigin="anonymous"
        />
        <script
          defer
          src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
          crossOrigin="anonymous"
        />
        <script
          defer
          src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased bg-black text-white" suppressHydrationWarning>
        <Providers initialToken={initialToken}>

          {allJsonLd.map((schema, index) => (
            <script
              key={index}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
          ))}
          <ClientVersionManager />
          <AchievementToast />
          {children}
        </Providers>
      </body>
    </html>
  );
}
