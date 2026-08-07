import { getOrders, getProducts, toApiError } from "./api";
import { getServerRequestOptions } from "./serverOptions";
import type { ApiError, Order, Product } from "@/types";

/**
 * Загрузка данных для серверного рендера.
 *
 * Ошибка не выбрасывается наружу: упавший запрос к API — не повод показывать
 * `error.tsx` вместо всей страницы. Сервер отдаёт разметку без данных, а
 * клиентский остров сам сходит за ними и покажет знакомый алерт с кнопкой
 * «Повторить». То есть недоступный API деградирует до прежнего клиентского
 * поведения, а не до белого экрана.
 */
export interface ServerData {
  orders?: readonly Order[];
  products?: readonly Product[];
  error?: ApiError;
}

export const loadOrdersAndProducts = async (): Promise<ServerData> => {
  const options = await getServerRequestOptions();

  try {
    const [orders, products] = await Promise.all([
      getOrders(options),
      getProducts(options),
    ]);

    return { orders, products };
  } catch (cause) {
    return { error: toApiError(cause) };
  }
};

/** Только приходы — странице продуктов список приходов не нужен. */
export const loadProducts = async (): Promise<ServerData> => {
  const options = await getServerRequestOptions();

  try {
    return { products: await getProducts(options) };
  } catch (cause) {
    return { error: toApiError(cause) };
  }
};

export const loadOrders = async (): Promise<ServerData> => {
  const options = await getServerRequestOptions();

  try {
    return { orders: await getOrders(options) };
  } catch (cause) {
    return { error: toApiError(cause) };
  }
};
