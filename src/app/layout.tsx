import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ReduxProvider } from "@/providers/ReduxProvider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vendora | Stay in control. Grow your business.",
  description: "Vendora Technologies - E-commerce platform and merchant dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
