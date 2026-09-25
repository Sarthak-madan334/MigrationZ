import type { Metadata } from "next";
import "../styles/tokens.css";

export const metadata: Metadata = {
  title: "Migration Rehearsal Agent",
  description: "Prove what your migration does to real data."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}