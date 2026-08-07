"use client";

import { useEffect, useState } from "react";

const SECOND_MS = 1_000;

/**
 * Текущее время, обновляемое таймером.
 *
 * `null` до первого тика — и это не лень, а защита от hydration mismatch в
 * фазе 2.1: время на сервере и в браузере отличается по определению, поэтому
 * первый рендер обеих сторон обязан быть одинаковым и пустым. Часы появляются
 * сразу после монтирования.
 *
 * Интервал снимается в cleanup — иначе таймер продолжал бы дёргать `setState`
 * у размонтированного компонента.
 */
export const useClock = (intervalMs: number = SECOND_MS): Date | null => {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
};
