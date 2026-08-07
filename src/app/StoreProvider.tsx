"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore, type RootState } from "@/lib/store";
import { useSocket } from "@/hooks";

interface StoreProviderProps {
  children: React.ReactNode;
  /**
   * Начальное состояние с сервера. Пока не передаётся ниоткуда — SSR приходит
   * в фазе 2.1, но провайдер готов к нему заранее, чтобы переход не потребовал
   * переписывать дерево компонентов (риск №2 из плана).
   */
  preloadedState?: Partial<RootState>;
}

/**
 * Держит соединение с сервером событий на всё время жизни приложения.
 *
 * Отдельный компонент, а не эффект в `StoreProvider`, по прозаичной причине:
 * `useSocket` работает через `useAppDispatch`, а тот требует, чтобы над ним
 * уже стоял `<Provider>`. Ничего не рендерит.
 */
const SocketConnection = () => {
  useSocket();
  return null;
};

export default function StoreProvider({
  children,
  preloadedState,
}: StoreProviderProps) {
  const storeRef = useRef<AppStore>(undefined);
  if (!storeRef.current) {
    // Стор создаётся один раз на монтирование: на сервере — на каждый запрос,
    // в браузере — на всё время жизни вкладки. Изменения `preloadedState`
    // после первого рендера намеренно игнорируются, иначе состояние
    // откатывалось бы к серверному снимку.
    storeRef.current = makeStore(preloadedState);
  }

  return (
    <Provider store={storeRef.current}>
      <SocketConnection />
      {children}
    </Provider>
  );
}
