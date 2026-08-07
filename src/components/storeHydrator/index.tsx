"use client";

import { useRef } from "react";
import { useAppStore } from "@/lib/hooks";
import { hydrate } from "@/lib/features/dataOrdersAndProducts/ordersAndProductsSlice";
import type { Order, Product } from "@/types";

export interface StoreHydratorProps {
  orders?: readonly Order[];
  products?: readonly Product[];
}

/**
 * Кладёт данные серверного рендера в стор. Ничего не рисует.
 *
 * Диспатч идёт **в теле компонента**, а не в `useEffect`: эффекты выполняются
 * после того, как отрисовалось всё поддерево, и список успел бы моргнуть
 * скелетонами при полностью готовых данных. Диспатч в рендере безопасен,
 * потому что меняет чужой стор, а не состояние React, и защищён ref'ом от
 * повтора при повторных рендерах и в StrictMode.
 *
 * Компонент должен стоять **выше** тех, кто читает эти данные, — тогда к их
 * первому рендеру стор уже заполнен.
 */
const StoreHydrator: React.FC<StoreHydratorProps> = ({ orders, products }) => {
  const store = useAppStore();
  const isHydrated = useRef(false);

  if (!isHydrated.current) {
    isHydrated.current = true;

    if (orders || products) {
      store.dispatch(hydrate({ orders, products }));
    }
  }

  return null;
};

export default StoreHydrator;
