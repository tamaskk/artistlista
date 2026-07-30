import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { FavoritesProvider } from "@/components/favorites/FavoritesProvider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ArtistList — Ki hol lép fel?",
    template: "%s · ArtistList",
  },
  description:
    "Magyar előadók és fellépések egy helyen: koncertek, bulik térképen és listában — szűrhetően városra, dátumra, műfajra és árra.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu" className={`${bricolage.variable} ${inter.variable}`}>
      <body>
        <FavoritesProvider>{children}</FavoritesProvider>
      </body>
    </html>
  );
}
