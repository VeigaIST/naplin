import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ParticipantProvider } from "@/components/participant-provider";
import { ThemeScript } from "@/components/theme-script";
import { ThemeSync } from "@/components/theme-sync";
import { THEME_COOKIE } from "@/lib/theme-constants";
import { Plus_Jakarta_Sans } from "next/font/google";
import { cookies } from "next/headers";

const fontNaplin = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-naplin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "naplin — Sleep Study Companion",
  description:
    "A minimalist companion app for sleep quality studies: diary, mood, quick events and cognitive tests.",
  applicationName: "naplin",
  appleWebApp: {
    capable: true,
    title: "naplin",
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#080b14",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = (await cookies()).get(THEME_COOKIE)?.value;
  const htmlClass = theme === "dark" ? "dark" : undefined;

  return (
    <html
      lang="pt-PT"
      className={`${fontNaplin.variable} ${htmlClass ?? ""}`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <ThemeScript />
        <ParticipantProvider>
          <ThemeSync />
          {children}
        </ParticipantProvider>
      </body>
    </html>
  );
}
