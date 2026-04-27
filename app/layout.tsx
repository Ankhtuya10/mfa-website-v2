import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Jost, Playfair_Display } from "next/font/google";
import { AnoceChatWidget } from "./components/AnoceChatWidget";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["200", "300", "400", "700"],
  variable: "--font-jost",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Anoce — The New Era of Mongolian Fashion",
  description: "Luxury fashion rooted in Mongolian heritage",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${jost.variable} ${playfair.variable} ${inter.variable}`}>
        {children}
        <AnoceChatWidget />
      </body>
    </html>
  );
}
