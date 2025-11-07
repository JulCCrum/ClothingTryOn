import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitMirror - Virtual Try-On",
  description: "Try any outfit in seconds with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
