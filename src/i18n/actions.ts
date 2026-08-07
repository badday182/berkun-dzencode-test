"use server";

import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "./config";

/**
 * Смена языка. Серверное действие, а не `document.cookie` из браузера:
 * словари подставляет серверный рендер, и он должен увидеть новое значение
 * при следующем же запросе. Клиенту остаётся вызвать `router.refresh()`.
 */
export const setLocaleCookie = async (locale: string): Promise<void> => {
  if (!isLocale(locale)) return;

  (await cookies()).set(LOCALE_COOKIE, locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    path: "/",
  });
};
