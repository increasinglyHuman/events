import type { Metadata } from "next";
import { Dongle, Space_Mono, Montserrat } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const dongle = Dongle({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dongle",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-mono",
});

const montserrat = Montserrat({
  weight: "900",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "poqpoq Events — Discover Virtual World Events",
  description:
    "Discover and attend virtual events in poqpoq World — live music, art galleries, workshops, gaming tournaments, social gatherings, and more.",
  icons: {
    icon: "/events/favicon.svg",
    apple: "/events/favicon.svg",
  },
  metadataBase: new URL("https://poqpoq.com"),
  openGraph: {
    title: "poqpoq Events — Discover Virtual World Events",
    description:
      "Live music, art galleries, workshops, gaming tournaments, social gatherings, and more in poqpoq World.",
    url: "https://poqpoq.com/events/",
    siteName: "poqpoq",
    images: [
      {
        url: "/events/og-image.png",
        width: 1200,
        height: 630,
        alt: "poqpoq Events — Discover Virtual World Events",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "poqpoq Events — Discover Virtual World Events",
    description:
      "Live music, art galleries, workshops, gaming tournaments, social gatherings, and more in poqpoq World.",
    images: ["/events/og-image.png"],
  },
  alternates: {
    canonical: "https://poqpoq.com/events/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${dongle.variable} ${spaceMono.variable} ${montserrat.variable}`}>
      <body className="min-h-screen h-full bg-bg-deep antialiased overflow-y-auto relative">
        {/* Oversized brand watermark — deep background hint */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center select-none"
        >
          <span
            className="font-[family-name:var(--font-montserrat)] text-[clamp(24rem,55vw,52rem)] font-black leading-none tracking-tighter text-white/[0.05] -rotate-[30deg]"
          >
            pOq
          </span>
        </div>
        <div className="relative z-10">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}
