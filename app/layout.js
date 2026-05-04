import { Manrope, Spectral } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/app/providers/AppStateProvider";
import Navbar from "@/components/Navbar";

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
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${spectral.variable} h-full antialiased`}
    >
      <body className="min-h-full expedition-body">
        <AppStateProvider>
          <Navbar />
          <div className="page-shell">{children}</div>
          <footer className="site-footer">
            This was developed by IHRR (Institute of Himalayan Risk Reduction)
          </footer>
        </AppStateProvider>
      </body>
    </html>
  );
}
