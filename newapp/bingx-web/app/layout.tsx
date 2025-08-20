import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BingX Dashboard - Test",
  description: "Test de diagnostic",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}