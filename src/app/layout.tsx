import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NPCP",
  description: "New Production Command Post for production task management, reporting, and productivity dashboards."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
