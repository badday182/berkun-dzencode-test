import { DEFAULT_LOCALE, INTL_LOCALES, isLocale } from "@/i18n/config";

/**
 * Форматирование дат карточек.
 *
 * Локаль передаётся аргументом, а не берётся из окружения: `toLocaleString`
 * без явного тега использует настройки браузера, и месяц в интерфейсе не
 * совпадал бы с выбранным языком. Значение приходит из `useLocale()`.
 *
 * TODO(2.1): при переходе на SSR зафиксировать таймзону на UTC — иначе сервер
 * и клиент дадут разный результат и React упадёт с hydration mismatch.
 */
const toIntlLocale = (locale: string): string =>
  isLocale(locale) ? INTL_LOCALES[locale] : INTL_LOCALES[DEFAULT_LOCALE];

/** `07 / авг. / 2026` — день, сокращённый месяц и год. */
export const formatDate = (dateString: string, locale: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString(toIntlLocale(locale), { month: "short" });
  const year = date.getFullYear();
  return `${day} / ${month} / ${year}`;
};

/** `08 / 26` — месяц и две последние цифры года; от локали не зависит. */
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  return `${month} / ${year}`;
};

/** Дата без времени — для гарантии в карточке продукта. */
export const formatDateOnly = (dateString: string, locale: string): string =>
  new Date(dateString).toLocaleDateString(toIntlLocale(locale));
