import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import "./globals.css";
import AppShell from "@/components/layout/appShell";
import StoreProvider from "./StoreProvider";

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

/**
 * Заголовок вкладки и описание тоже переводятся: они видны пользователю и
 * попадают в выдачу. Статический `metadata` для этого не годится — локаль
 * известна только на запросе.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Локаль приходит из cookie через `i18n/request.ts`; в `lang` она нужна для
  // экранных читалок и переносов слов.
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Провайдер без пропсов: словари и локаль он берёт из серверного
            контекста запроса. Клиентские компоненты внутри получают `t()`. */}
        <NextIntlClientProvider>
          {/* Каркас внутри провайдера стора: и сайдбар, и шапка читают стор. */}
          <StoreProvider>
            <AppShell>{children}</AppShell>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
