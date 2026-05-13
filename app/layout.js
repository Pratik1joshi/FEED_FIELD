import { Manrope, Spectral } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/app/providers/AppStateProvider";
import Navbar from "@/components/Navbar";
import OfflineIndicator from "@/components/OfflineIndicator";
import SiteFooter from "@/components/SiteFooter";
import { ServiceWorkerRegistry } from "@/components/ServiceWorkerRegistry";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spectral = Spectral({
  variable: "--font-spectral",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Field Expedition Platform",
  description: "Interactive Nepal route map with document-based learning.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "IHRR Expeditions",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${spectral.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="IHRR Expeditions" />
      </head>
      <body className="min-h-full expedition-body">
        <AppStateProvider>
          <ServiceWorkerRegistry />
          <OfflineIndicator />
          <Navbar />
          <div className="page-shell">{children}</div>
          <SiteFooter />
        </AppStateProvider>
      </body>
    </html>
  );
}
