import { http, type RequestOptions } from "../http";
import { parseCollection, parseEntity } from "./parse";
import {
  parseOrder,
  type CreateOrderDto,
  type Order,
  type OrderId,
} from "@/types";

/**
 * Приходы: тонкая типизированная обёртка над HTTP-контрактом API.
 *
 * Модуль изоморфный — ни `window`, ни React, ни Redux, только `services/http`.
 * Его одинаково зовут `createAsyncThunk` в браузере и серверный компонент в
 * фазе 2.1; ради второго случая у каждого метода есть `options` — туда уйдут
 * `signal` и заголовок `Cookie`.
 *
 * Здесь нет ни кеша, ни состояния: слой отвечает ровно за «запрос → разобранные
 * доменные объекты». Состояние живёт в сторе.
 */

/** `GET /orders`. Пагинации на бэке нет — приходит весь список. */
export const getOrders = async (
  options?: RequestOptions
): Promise<readonly Order[]> =>
  parseCollection(await http.get<unknown>("/orders", options), parseOrder);

/** `POST /orders` → `201` с приходом, которому сервер выдал `id`. */
export const createOrder = async (
  dto: CreateOrderDto,
  options?: RequestOptions
): Promise<Order> =>
  parseEntity(await http.post<unknown>("/orders", dto, options), parseOrder);

/**
 * `DELETE /orders/:id` → `204` без тела.
 *
 * Продукты прихода сервер удаляет каскадом и отдельных `product:deleted` не
 * шлёт, поэтому в сторе за этим вызовом обязана следовать пара
 * `deleteOrder` + `deleteAllOrderProduct` — иначе останутся продукты-сироты.
 */
export const deleteOrder = async (
  id: OrderId,
  options?: RequestOptions
): Promise<void> => {
  await http.delete(`/orders/${id}`, options);
};
