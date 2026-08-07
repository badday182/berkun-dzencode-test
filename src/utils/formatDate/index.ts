import { DEFAULT_LOCALE, INTL_LOCALES, isLocale } from "@/i18n/config";

/**
 * Форматирование дат карточек.
 *
 * Два правила, оба вынужденные.
 *
 * **Локаль передаётся аргументом.** `toLocaleString` без явного тега берёт
 * настройки браузера, и месяц в интерфейсе не совпадал бы с выбранным языком.
 * Значение приходит из `useLocale()`; функция остаётся чистой и пригодной для
 * серверного кода и тестов.
 *
 * **Таймзона зафиксирована на UTC.** С фазы 2.1 разметку рисует сервер, а
 * гидрирует браузер — и у них разные часовые пояса. Дата `2023-03-15 09:30`,
 * отформатированная в Киеве и на сервере в UTC, дала бы разные строки, а React
 * при расхождении ругается на hydration mismatch и перерисовывает поддерево.
 * UTC — единственный вариант, одинаковый для всех.
 */
const UTC = "UTC";

const toIntlLocale = (locale: string): string =>
  isLocale(locale) ? INTL_LOCALES[locale] : INTL_LOCALES[DEFAULT_LOCALE];

/** Формат API: `2023-03-15 09:30:45`, без указания зоны. */
const NAIVE_DATE = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/;

/**
 * Разбор строки API как UTC.
 *
 * Без этого фиксация вывода на UTC не помогает, а вредит: `new Date("2023-03-15
 * 01:30:00")` без указания зоны разбирается как **местное** время, поэтому в
 * Киеве это 22:30 предыдущего дня по UTC, а на сервере в UTC — 01:30 текущего.
 * Вывод в UTC при местном разборе дал бы 14-е число в браузере и 15-е на
 * сервере — ровно тот hydration mismatch, от которого фиксация и защищает.
 * Строки с явной зоной (`…Z`, `…+03:00`) пропускаются как есть.
 */
const parseAsUtc = (dateString: string): Date =>
  new Date(
    NAIVE_DATE.test(dateString)
      ? `${dateString.replace(" ", "T")}Z`
      : dateString
  );

/** `07 / авг. / 2026` — день, сокращённый месяц и год. */
export const formatDate = (dateString: string, locale: string): string => {
  const date = parseAsUtc(dateString);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = date.toLocaleString(toIntlLocale(locale), {
    month: "short",
    timeZone: UTC,
  });
  const year = date.getUTCFullYear();
  return `${day} / ${month} / ${year}`;
};

/** `08 / 26` — месяц и две последние цифры года; от локали не зависит. */
export const formatDateShort = (dateString: string): string => {
  const date = parseAsUtc(dateString);
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear().toString().slice(-2);
  return `${month} / ${year}`;
};

/** Дата без времени — для гарантии в карточке продукта. */
export const formatDateOnly = (dateString: string, locale: string): string =>
  parseAsUtc(dateString).toLocaleDateString(toIntlLocale(locale), {
    timeZone: UTC,
  });
