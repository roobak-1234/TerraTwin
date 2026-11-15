import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TerraTwin — 2026 NASA Space Apps Planetary Analog Explorer",
  description:
    "Multi-Scale Moon & Mars Analog Discovery Engine synthesizing NASA, CSA, ESA, and JAXA data across 8 scientific dimensions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#020617" }}>{children}</body>
    </html>
  );
}
