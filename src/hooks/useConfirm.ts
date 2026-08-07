"use client";

import { useCallback, useState } from "react";

export interface UseConfirmResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/**
 * Состояние модалки подтверждения.
 *
 * Мелочь, но одинаковая тройка `useState` + `open` + `close` была скопирована
 * в три карточки; теперь у неё одно место. `useCallback` здесь не ради
 * производительности, а ради стабильности ссылки: `close` уходит в проп
 * `onClose`, который у `ModalWindow` стоит в зависимостях эффекта с подпиской
 * на Escape.
 */
export const useConfirm = (): UseConfirmResult => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, open, close };
};
