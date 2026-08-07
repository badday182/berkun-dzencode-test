"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProducts } from "@/lib/features/dataOrdersAndProducts/ordersAndProductsSlice";
import { isPendingStatus, type ApiError, type Product } from "@/types";

export interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

/** То же, что {@link useOrders}, но для каталога продуктов. */
export const useProducts = (): UseProductsResult => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(
    (state) => state.ordersAndProductsData.products
  );
  const status = useAppSelector(
    (state) => state.ordersAndProductsData.productsStatus
  );
  const error = useAppSelector(
    (state) => state.ordersAndProductsData.productsError
  );

  useEffect(() => {
    void dispatch(fetchProducts());
  }, [dispatch]);

  const refetch = useCallback(() => {
    void dispatch(fetchProducts({ force: true }));
  }, [dispatch]);

  return { products, isLoading: isPendingStatus(status), error, refetch };
};
