"use client";

import { useState, useEffect } from "react";

const TopMenu = () => {
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString("ru-RU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = currentDateTime.toLocaleTimeString("ru-RU");

  return (
    <div className="container-fluid">
      <div className="ms-auto d-flex flex-column align-items-end">
        <div className="text-muted small">{formattedDate}</div>
        <div className="fw-bold">{formattedTime}</div>
      </div>
    </div>
  );
};

export default TopMenu;
