/**
 * Настройки локализации. Общий модуль для сервера и клиента: список локалей
 * нужен и `getRequestConfig`, и переключателю в шапке.
 *
 * URL локалью не размечается — вариант `/en/orders` потребовал бы сегмента
 * `[locale]` и переписывания всех маршрутов, включая `/orders/[id]` и 404,
 * ради приложения, где язык выбирает один и тот же пользователь для себя.
 * Выбор хранится в cookie, как и записано в решении по фазе 1.5.
 */

export const LOCALES = ["ru", "en", "uk"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ru";

/** Имя cookie с выбранной локалью. Читается на сервере при каждом запросе. */
export const LOCALE_COOKIE = "locale";

/** Год: язык — долгоживущее решение, переспрашивать каждую сессию незачем. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

/** Подписи для переключателя — на своём языке, а не переведённые. */
export const LOCALE_LABELS: Record<Locale, string> = {
  ru: "Рус",
  en: "Eng",
  uk: "Укр",
};

/**
 * Тег для `Intl`. Совпадает с кодом локали, но объявлен отдельно: `uk` для
 * дат должен быть `uk-UA`, иначе форматирование берёт умолчания браузера.
 */
export const INTL_LOCALES: Record<Locale, string> = {
  ru: "ru-RU",
  en: "en-US",
  uk: "uk-UA",
};
