import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitMirror — Virtual Try-On",
  description: "Try any outfit in seconds with AI-powered virtual fitting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise">{children}</body>
    </html>
  );
}
