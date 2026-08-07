"use client";

import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import SessionCounter from "@/components/sessionCounter";
import LocaleSwitcher from "../localeSwitcher";
import { useClock } from "@/hooks";
import { useAppDispatch } from "@/lib/hooks";
import { setMobileSidebarOpen } from "@/lib/features/layout/layoutSlice";
import { INTL_LOCALES, isLocale } from "@/i18n/config";
import styles from "./index.module.css";

/**
 * Верхняя панель: бургер для мобильного меню, счётчик сессий, часы,
 * переключатель языка и профиль.
 *
 * Ссылки на разделы отсюда ушли в сайдбар — держать две навигации сразу
 * незачем.
 */
const Topbar = () => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const locale = useLocale();
  const currentDateTime = useClock();

  // Дата форматируется по выбранной локали, а не по зашитой «ru-RU».
  const intlLocale = isLocale(locale) ? INTL_LOCALES[locale] : locale;
  const formattedDate = currentDateTime?.toLocaleDateString(intlLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentDateTime?.toLocaleTimeString(intlLocale);

  return (
    <header className={clsx("d-flex align-items-center gap-3", styles.topbar)}>
      <button
        type="button"
        className={clsx("btn btn-outline-secondary border-0", styles.burger)}
        onClick={() => dispatch(setMobileSidebarOpen(true))}
        aria-label={t("nav.openMenu")}
      >
        <i className="bi bi-list fs-5" />
      </button>

      <div className="ms-auto d-flex align-items-center gap-3">
        <SessionCounter />

        {/* Пока часы не пошли, место под них зарезервировано неразрывным
            пробелом — иначе шапка подпрыгивает после гидрации. */}
        <div className="d-none d-md-flex flex-column align-items-end">
          <div className="text-muted small text-capitalize">
            {formattedDate ?? " "}
          </div>
          <div className="fw-bold">{formattedTime ?? " "}</div>
        </div>

        <LocaleSwitcher />

        {/* TODO(2.2): настоящий профиль появится вместе с JWT-авторизацией */}
        <div className="d-flex align-items-center gap-2">
          <span
            className={clsx(
              "d-flex align-items-center justify-content-center",
              styles.avatar
            )}
            aria-hidden="true"
          >
            <i className="bi bi-person" />
          </span>
          <span className="small text-muted d-none d-sm-inline">
            {t("topbar.guest")}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
