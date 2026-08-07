"use client";

import { useCallback, useState } from "react";

export interface UseConfirmResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/**
 * Состояние модального окна: открыто, открыть, закрыть.
 *
 * Названо по первому применению — подтверждению удаления, одинаковая тройка
 * `useState` + `open` + `close` была скопирована в три карточки. С фазы 1.4 им
 * же открываются окна форм: состояние у них ровно то же самое, и заводить
 * второй такой хук ради названия смысла нет.
 *
 * `useCallback` здесь не ради производительности, а ради стабильности ссылки:
 * `close` уходит в проп `onClose`, который у `Modal` стоит в зависимостях
 * эффекта с подпиской на Escape.
 */
export const useConfirm = (): UseConfirmResult => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, open, close };
};
