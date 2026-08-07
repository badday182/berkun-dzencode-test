"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { setLocaleCookie } from "@/i18n/actions";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";
import styles from "./index.module.css";

/**
 * Переключатель языка.
 *
 * Cookie ставит серверное действие, а не браузер: словари подставляются на
 * сервере, и он должен увидеть новое значение. После этого `router.refresh()`
 * перезапрашивает разметку — состояние стора при этом остаётся на месте, в
 * отличие от полной перезагрузки страницы.
 */
const LocaleSwitcher = () => {
  const t = useTranslations("topbar");
  const activeLocale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const change = (locale: Locale) => {
    if (locale === activeLocale) return;

    startTransition(async () => {
      await setLocaleCookie(locale);
      router.refresh();
    });
  };

  return (
    <div
      className="btn-group btn-group-sm"
      role="group"
      aria-label={t("language")}
    >
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          className={clsx(
            "btn",
            locale === activeLocale ? "btn-secondary" : "btn-outline-secondary",
            styles.button
          )}
          onClick={() => change(locale)}
          disabled={isPending}
          aria-pressed={locale === activeLocale}
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </div>
  );
};

export default LocaleSwitcher;
