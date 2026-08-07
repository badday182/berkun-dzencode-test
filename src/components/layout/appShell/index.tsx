"use client";

import clsx from "clsx";
import Sidebar from "../sidebar";
import Topbar from "../topbar";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setMobileSidebarOpen } from "@/lib/features/layout/layoutSlice";
import styles from "./index.module.css";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Каркас страницы: сайдбар слева, шапка сверху, содержимое под ней.
 *
 * Клиентский компонент, потому что держит затемнение под выехавшим меню — на
 * узком экране клик мимо панели должен её закрывать. Сами страницы остаются
 * какими были: каркас ничего о них не знает и не мешает фазе 2.1 сделать их
 * серверными.
 */
const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const isMobileSidebarOpen = useAppSelector(
    (state) => state.layout.isMobileSidebarOpen
  );

  return (
    <div className={clsx("d-flex", styles.shell)}>
      <Sidebar />

      {isMobileSidebarOpen && (
        <div
          className={styles.backdrop}
          onClick={() => dispatch(setMobileSidebarOpen(false))}
          aria-hidden="true"
        />
      )}

      <div className={clsx("d-flex flex-column flex-grow-1", styles.content)}>
        <Topbar />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
