"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  setMobileSidebarOpen,
  toggleSidebarCollapsed,
} from "@/lib/features/layout/layoutSlice";
import styles from "./index.module.css";

interface NavItem {
  href: string;
  /** Класс bootstrap-icons без префикса `bi-`. */
  icon: string;
  label: string;
  /** Раздел ещё не сделан: пункт виден, но никуда не ведёт. */
  disabled?: boolean;
}

// TODO(1.5): подписи вынести в словари next-intl
const NAV_ITEMS: readonly NavItem[] = [
  { href: "/orders", icon: "box-seam", label: "Приходы" },
  { href: "/products", icon: "boxes", label: "Продукты" },
  // TODO(2.4): страница дашборда с чартами
  { href: "/dashboard", icon: "bar-chart", label: "Дашборд", disabled: true },
  // TODO(2.2): настройки появятся вместе с профилем и авторизацией
  { href: "/settings", icon: "gear", label: "Настройки", disabled: true },
];

/**
 * Левое меню приложения.
 *
 * Пункты несуществующих разделов показаны неактивными, а не ссылками: клик по
 * рабочему на вид пункту с последующей 404 выглядит поломкой, а не
 * незавершённостью.
 */
const Sidebar = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector(
    (state) => state.layout.isSidebarCollapsed
  );
  const isMobileOpen = useAppSelector(
    (state) => state.layout.isMobileSidebarOpen
  );

  const closeOnMobile = () => dispatch(setMobileSidebarOpen(false));

  return (
    <aside
      // Классы модуля добавляются условием, а не вычисляемым ключом: под
      // `noUncheckedIndexedAccess` они имеют тип `string | undefined`.
      className={clsx(
        styles.sidebar,
        isCollapsed && styles.sidebar_collapsed,
        isMobileOpen && styles.sidebar_open
      )}
    >
      <div className={styles.sidebar__header}>
        {!isCollapsed && (
          <span className={styles.sidebar__brand}>DzenCode</span>
        )}
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary border-0"
          onClick={() => dispatch(toggleSidebarCollapsed())}
          // TODO(1.5): вынести в словари next-intl
          aria-label={isCollapsed ? "Развернуть меню" : "Свернуть меню"}
          title={isCollapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          <i
            className={clsx(
              "bi",
              isCollapsed ? "bi-chevron-double-right" : "bi-chevron-double-left"
            )}
          />
        </button>
      </div>

      <nav className={styles.sidebar__nav}>
        <ul className="nav flex-column">
          {NAV_ITEMS.map((item) => (
            <li className="nav-item" key={item.href}>
              {item.disabled ? (
                <span
                  className={clsx(
                    "nav-link",
                    styles.item,
                    styles.item_disabled
                  )}
                  title={
                    // TODO(1.5): вынести в словари next-intl
                    `${item.label} — раздел в разработке`
                  }
                  aria-disabled="true"
                >
                  <i
                    className={clsx("bi", `bi-${item.icon}`, styles.item__icon)}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={clsx(
                    "nav-link",
                    styles.item,
                    pathname.startsWith(item.href) && styles.item_active
                  )}
                  onClick={closeOnMobile}
                  title={item.label}
                >
                  <i
                    className={clsx("bi", `bi-${item.icon}`, styles.item__icon)}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
