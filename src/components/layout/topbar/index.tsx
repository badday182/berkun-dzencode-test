"use client";

import clsx from "clsx";
import SessionCounter from "@/components/sessionCounter";
import { useClock } from "@/hooks";
import { useAppDispatch } from "@/lib/hooks";
import { setMobileSidebarOpen } from "@/lib/features/layout/layoutSlice";
import styles from "./index.module.css";

/**
 * Верхняя панель: бургер для мобильного меню, счётчик сессий, часы и профиль.
 *
 * Ссылки на разделы отсюда ушли в сайдбар — держать две навигации сразу
 * незачем.
 */
const Topbar = () => {
  const dispatch = useAppDispatch();
  const currentDateTime = useClock();

  // TODO(1.5): локаль зашита строкой, уедет в next-intl
  const formattedDate = currentDateTime?.toLocaleDateString("ru-RU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentDateTime?.toLocaleTimeString("ru-RU");

  return (
    <header className={clsx("d-flex align-items-center gap-3", styles.topbar)}>
      <button
        type="button"
        className={clsx("btn btn-outline-secondary border-0", styles.burger)}
        onClick={() => dispatch(setMobileSidebarOpen(true))}
        // TODO(1.5): вынести в словари next-intl
        aria-label="Открыть меню"
      >
        <i className="bi bi-list fs-5" />
      </button>

      <div className="ms-auto d-flex align-items-center gap-3">
        <SessionCounter />

        {/* Пока часы не пошли, место под них зарезервировано неразрывным
            пробелом — иначе шапка подпрыгивает после гидрации. */}
        <div className="d-flex flex-column align-items-end">
          <div className="text-muted small text-capitalize">
            {formattedDate ?? " "}
          </div>
          <div className="fw-bold">{formattedTime ?? " "}</div>
        </div>

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
          {/* TODO(1.5): вынести в словари next-intl */}
          <span className="small text-muted d-none d-sm-inline">Гость</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
