"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  socketConnectionStarted,
  socketConnectionStopped,
} from "@/lib/features/session/sessionSlice";

/**
 * Жизненный цикл соединения с сервером событий, привязанный к жизни компонента.
 *
 * Сам сокет открывает `listenerMiddleware` — хук только сообщает стору, что
 * вкладка появилась и что она закрылась. Вызывать его нужно ровно один раз, на
 * верхнем уровне приложения: подписка одна на всё приложение, и второй вызов
 * приведёт к тому, что размонтирование одного компонента оборвёт соединение,
 * нужное другому.
 */
export const useSocket = (): { isConnected: boolean } => {
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector(
    (state) => state.session.isSocketConnected
  );

  useEffect(() => {
    dispatch(socketConnectionStarted());

    return () => {
      dispatch(socketConnectionStopped());
    };
  }, [dispatch]);

  return { isConnected };
};
