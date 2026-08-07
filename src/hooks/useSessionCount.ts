"use client";

import { useAppSelector } from "@/lib/hooks";

export interface UseSessionCountResult {
  activeSessions: number;
  isConnected: boolean;
}

/**
 * Счётчик активных сессий вместе с состоянием связи.
 *
 * Одно без другого бессмысленно: число, полученное до разрыва, устаревает
 * мгновенно, поэтому показывать его можно только вместе с признаком «связь
 * есть».
 */
export const useSessionCount = (): UseSessionCountResult => {
  const activeSessions = useAppSelector(
    (state) => state.session.activeSessions
  );
  const isConnected = useAppSelector(
    (state) => state.session.isSocketConnected
  );

  return { activeSessions, isConnected };
};
