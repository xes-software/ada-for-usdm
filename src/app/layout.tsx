import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "xes.software LLC",
  description: "Cardano/Bitcoin DeFi Template",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-white`}>{children}</body>
    </html>
  );
}
