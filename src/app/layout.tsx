import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Instant Placement | Verified Jobs in India & Direct HR Connect",
  description:
    "Find verified jobs in Surat Gujarat, Mumbai, Bengaluru, Pune, and all India. Call HR directly with 0% consultancy fees. Direct hiring for Telecaller, Delivery, Back Office, Sales, and IT roles.",
  keywords: [
    "WorkIndia",
    "Apna",
    "Jobs in India",
    "Direct HR Call",
    "Telecaller Jobs",
    "Delivery Partner Jobs",
    "Back Office Jobs",
    "Freshers Jobs",
    "Work from Home Jobs",
    "Instant Placement",
  ],
  openGraph: {
    title: "Instant Placement | Verified Jobs in India & Direct HR Connect",
    description:
      "Find verified jobs in Surat Gujarat, Mumbai, Bengaluru, Pune, and all India. Call HR directly with 0% consultancy fees.",
    siteName: "Instant Placement",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var origSetAttr = Element.prototype.setAttribute;
                Element.prototype.setAttribute = function(name, val) {
                  if (name === 'bis_skin_checked') return;
                  return origSetAttr.apply(this, arguments);
                };
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white`}
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-slate-900 focus:px-3 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold">
          Skip to main content
        </a>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
