"use client";

import { useEffect } from "react";
import { notFound } from "next/navigation";
import OrdersView from "../ordersView";
import { useOrders } from "@/hooks";
import { useAppDispatch } from "@/lib/hooks";
import {
  setSelectedOrderId,
  setSelectedOrderTitle,
  toggleAsideContainer,
} from "@/lib/features/orders/ordersSlice";
import type { OrderId } from "@/types";

export interface OrderDeepLinkProps {
  orderId: OrderId;
}

/**
 * Клиентская часть страницы `/orders/[id]`: выбирает приход из адреса и
 * отдаёт 404, если такого прихода нет.
 *
 * Существование прихода проверяется по уже загруженному списку — отдельного
 * `GET /orders/:id` на бэке нет, а список этой странице нужен в любом случае.
 */
const OrderDeepLink: React.FC<OrderDeepLinkProps> = ({ orderId }) => {
  const dispatch = useAppDispatch();
  const { orders, isLoading } = useOrders();

  const order = orders.find((item) => item.id === orderId);

  useEffect(() => {
    if (!order) return;

    dispatch(toggleAsideContainer(true));
    dispatch(setSelectedOrderId(order.id));
    dispatch(setSelectedOrderTitle(order.title));
  }, [dispatch, order]);

  // Отсутствие в списке — приговор только после загрузки, иначе 404 мелькал бы
  // у всех на долю секунды.
  if (!isLoading && !order) notFound();

  return <OrdersView />;
};

export default OrderDeepLink;
