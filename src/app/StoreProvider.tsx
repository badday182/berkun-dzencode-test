"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore, type RootState } from "@/lib/store";

interface StoreProviderProps {
  children: React.ReactNode;
  /**
   * Начальное состояние с сервера. Пока не передаётся ниоткуда — SSR приходит
   * в фазе 2.1, но провайдер готов к нему заранее, чтобы переход не потребовал
   * переписывать дерево компонентов (риск №2 из плана).
   */
  preloadedState?: Partial<RootState>;
}

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

  return <Provider store={storeRef.current}>{children}</Provider>;
}
