import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TDC e-Asset - ระบบบริหารจัดการครุภัณฑ์",
  description: "ระบบบริหารจัดการครุภัณฑ์ภายในหน่วยงาน พร้อมติดตามประวัติยืม-คืน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
