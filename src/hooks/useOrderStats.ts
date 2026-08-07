"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/lib/hooks";
import getOrderStats from "@/utils/getOrderStats";
import type { OrderId, OrderStats } from "@/types";

/**
 * Количество продуктов в приходе и суммы по валютам.
 *
 * Сама арифметика осталась в `utils/getOrderStats` — чистой функции, которую
 * можно вызвать откуда угодно и накрыть тестом без React. Хук добавляет к ней
 * ровно две вещи: берёт продукты из стора и мемоизирует результат, чтобы
 * пересчёт шёл при изменении списка, а не на каждый рендер карточки.
 */
export const useOrderStats = (orderId: OrderId): OrderStats => {
  const products = useAppSelector(
    (state) => state.ordersAndProductsData.products
  );

  return useMemo(() => getOrderStats(orderId, products), [orderId, products]);
};
