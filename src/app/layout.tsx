import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ReduxProvider } from "@/providers/ReduxProvider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vendora | Sell faster. Stock smarter. Scale with confidence.",
  description: "Vendora is a retail operations platform for sales, inventory, locations, customers, and role-based access.",
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
