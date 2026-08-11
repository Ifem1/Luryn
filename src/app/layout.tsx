import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Luryn — Defensive decoy intelligence", description: "Experimental GenLayer defensive cyberdeception lab." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
