"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
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
  /** Ключ подписи в словаре `nav`. */
  labelKey: "orders" | "products" | "dashboard" | "settings";
  /** Раздел ещё не сделан: пункт виден, но никуда не ведёт. */
  disabled?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/orders", icon: "box-seam", labelKey: "orders" },
  { href: "/products", icon: "boxes", labelKey: "products" },
  // TODO(2.4): страница дашборда с чартами
  {
    href: "/dashboard",
    icon: "bar-chart",
    labelKey: "dashboard",
    disabled: true,
  },
  // TODO(2.2): настройки появятся вместе с профилем и авторизацией
  { href: "/settings", icon: "gear", labelKey: "settings", disabled: true },
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
  const t = useTranslations("nav");
  const tApp = useTranslations("app");
  const isCollapsed = useAppSelector(
    (state) => state.layout.isSidebarCollapsed
  );
  const isMobileOpen = useAppSelector(
    (state) => state.layout.isMobileSidebarOpen
  );

  const closeOnMobile = () => dispatch(setMobileSidebarOpen(false));
  const toggleLabel = isCollapsed ? t("expand") : t("collapse");

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
          <span className={styles.sidebar__brand}>{tApp("brand")}</span>
        )}
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary border-0"
          onClick={() => dispatch(toggleSidebarCollapsed())}
          aria-label={toggleLabel}
          title={toggleLabel}
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
          {NAV_ITEMS.map((item) => {
            const label = t(item.labelKey);

            return (
              <li className="nav-item" key={item.href}>
                {item.disabled ? (
                  <span
                    className={clsx(
                      "nav-link",
                      styles.item,
                      styles.item_disabled
                    )}
                    title={t("inDevelopment", { section: label })}
                    aria-disabled="true"
                  >
                    <i
                      className={clsx(
                        "bi",
                        `bi-${item.icon}`,
                        styles.item__icon
                      )}
                    />
                    {!isCollapsed && <span>{label}</span>}
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
                    title={label}
                  >
                    <i
                      className={clsx(
                        "bi",
                        `bi-${item.icon}`,
                        styles.item__icon
                      )}
                    />
                    {!isCollapsed && <span>{label}</span>}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
