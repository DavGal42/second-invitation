import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Աշոտ և Մարիամ — Հարսանեկան հրավեր",
  description: "Աշոտի և Մարիամի հարսանեկան օրվա առցանց հրավերը։",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hy">
      <body>{children}</body>
    </html>
  );
}
