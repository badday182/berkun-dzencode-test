"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchOrders } from "@/lib/features/dataOrdersAndProducts/ordersAndProductsSlice";
import { isPendingStatus, type ApiError, type Order } from "@/types";

export interface UseOrdersResult {
  orders: Order[];
  isLoading: boolean;
  error: ApiError | null;
  /** Перечитать список, игнорируя то, что он уже загружен. */
  refetch: () => void;
}

/**
 * Приходы из стора с гарантией, что запрос за ними отправлен.
 *
 * Компонент больше не пишет `useEffect` с диспатчем — он говорит «мне нужны
 * приходы». Повторные вызовы безопасны: `condition` внутри thunk'а отсекает
 * лишние запросы, поэтому хук можно звать хоть из трёх компонентов сразу.
 */
export const useOrders = (): UseOrdersResult => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.ordersAndProductsData.orders);
  const status = useAppSelector(
    (state) => state.ordersAndProductsData.ordersStatus
  );
  const error = useAppSelector(
    (state) => state.ordersAndProductsData.ordersError
  );

  useEffect(() => {
    void dispatch(fetchOrders());
  }, [dispatch]);

  const refetch = useCallback(() => {
    void dispatch(fetchOrders({ force: true }));
  }, [dispatch]);

  return { orders, isLoading: isPendingStatus(status), error, refetch };
};
