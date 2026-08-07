"use client";

import SessionCounter from "../sessionCounter";
import { useClock } from "@/hooks";

const TopMenu = () => {
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
    <div className="container-fluid">
      <div className="ms-auto d-flex align-items-center gap-3">
        <SessionCounter />
        {/* Пока часы не пошли, место под них зарезервировано неразрывным
            пробелом — иначе шапка подпрыгивает после гидрации. */}
        <div className="d-flex flex-column align-items-end">
          <div className="text-muted small">{formattedDate ?? " "}</div>
          <div className="fw-bold">{formattedTime ?? " "}</div>
        </div>
      </div>
    </div>
  );
};

export default TopMenu;
