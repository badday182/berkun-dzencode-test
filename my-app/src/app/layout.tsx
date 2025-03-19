import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavigationMenu from "@/components/navigationMenu";
import StoreProvider from "./StoreProvider";
import AnimatedLayout from "@/components/AnimatedLayout";
import { ReactNode } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dzen",
  description: "Orders & Products",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NavigationMenu />
        <StoreProvider>
          <AnimatedLayout>{children}</AnimatedLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
