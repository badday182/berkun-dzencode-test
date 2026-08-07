import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "./config";

/**
 * Конфигурация next-intl на каждый запрос: какая локаль и какие словари.
 *
 * Локаль берётся из cookie, а не из URL — маршруты остаются без сегмента
 * `[locale]`. Значение прогоняется через `isLocale`: cookie правит кто угодно,
 * а `import` по неизвестному имени файла упал бы с ошибкой рендера.
 */
export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
