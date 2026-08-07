"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Значение, переживающее перезагрузку страницы.
 *
 * Первый рендер всегда отдаёт `initialValue`, а не то, что лежит в хранилище:
 * на сервере `localStorage` не существует, и попытка прочитать его сразу
 * привела бы к разной разметке на сервере и в браузере. Настоящее значение
 * подставляется в эффекте — то есть возможен один кадр со значением по
 * умолчанию, и это осознанный размен ради корректной гидрации.
 *
 * Событие `storage` браузер шлёт только другим вкладкам, поэтому подписка на
 * него синхронизирует их между собой и не создаёт петли в текущей.
 */
export const useLocalStorage = <TValue>(
  key: string,
  initialValue: TValue
): [TValue, (value: TValue) => void] => {
  const [value, setValue] = useState<TValue>(initialValue);

  const read = useCallback((): TValue | undefined => {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return undefined;

    try {
      return JSON.parse(raw) as TValue;
    } catch {
      // Мусор в хранилище — не повод падать: чинится следующей записью.
      console.warn(`Не удалось разобрать localStorage["${key}"]`);
      return undefined;
    }
  }, [key]);

  useEffect(() => {
    const stored = read();
    if (stored !== undefined) setValue(stored);

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      const updated = read();
      if (updated !== undefined) setValue(updated);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, read]);

  const store = useCallback(
    (next: TValue) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Приватный режим или переполненная квота — состояние в памяти
        // остаётся корректным, теряется только сохранение между сессиями.
        console.warn(`Не удалось записать localStorage["${key}"]`);
      }
    },
    [key]
  );

  return [value, store];
};
