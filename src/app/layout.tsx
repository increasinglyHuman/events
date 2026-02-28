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
  title: "poqpoq Events",
  description:
    "Discover and attend virtual events in poqpoq World — live music, art galleries, workshops, gaming tournaments, social gatherings, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${dongle.variable} ${spaceMono.variable} ${montserrat.variable}`}>
      <body className="min-h-screen h-full bg-bg-deep antialiased overflow-y-auto">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
