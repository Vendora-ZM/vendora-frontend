import type { Metadata } from "next";
import { ReduxProvider } from "@/providers/ReduxProvider";
import "./globals.css";

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
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
