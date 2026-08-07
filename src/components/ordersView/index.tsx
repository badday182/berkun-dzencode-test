"use client";

import clsx from "clsx";
import { useAppSelector } from "@/lib/hooks";
import { useOrders, useProducts } from "@/hooks";
import OrderCard from "../orderCard";
import OrderProductsCard from "../orderProductsCard";
import CardPlaceholder from "../cardPlaceholder";

const PLACEHOLDER_COUNT = 8;

/**
 * Список приходов с боковой панелью выбранного прихода.
 *
 * Вынесен из страницы, потому что страниц теперь две: `/orders` и
 * `/orders/[id]` — вторая показывает то же самое, но с приходом, выбранным по
 * адресу. Дублировать разметку ради этого не пришлось.
 */
const OrdersView = () => {
  const {
    orders,
    isLoading: isOrdersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useOrders();
  const {
    isLoading: isProductsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts();

  const isOpenAsideContainer = useAppSelector(
    (state) => state.orders.isOpenAsideContainer
  );

  // Продукты нужны карточке прихода для счётчиков и сумм, поэтому ждём оба
  // запроса: показать приход с нулями, а через секунду с суммами — хуже.
  const isLoading = isOrdersLoading || isProductsLoading;
  const error = ordersError ?? productsError;

  const retry = () => {
    refetchOrders();
    refetchProducts();
  };

  const placeholders = Array.from({ length: PLACEHOLDER_COUNT });

  return (
    <div className="container">
      <h1 className="mb-4">Orders</h1>
      {error && (
        <div
          className="alert alert-danger d-flex align-items-center justify-content-between"
          role="alert"
        >
          {/* TODO(1.5): вынести в словари next-intl */}
          <span>Не удалось загрузить данные: {error.message}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={retry}
          >
            Повторить
          </button>
        </div>
      )}
      <div className="container mt-3 d-flex flex-row">
        {/* TODO(1.4): класс `orders` — литеральная строка, а не класс CSS-модуля,
            поэтому ширина 30% из `app/orders/index.module.css` никогда не
            применялась. Разбирается вместе с раскладкой при вводе сайдбара. */}
        <div className={clsx("flex-grow-1", { orders: isOpenAsideContainer })}>
          <div>
            {isLoading ? (
              <div className="container mt-3 d-flex flex-column gap-3">
                {placeholders.map((_, index) => (
                  <CardPlaceholder key={`placeholder-${index}`} />
                ))}
              </div>
            ) : (
              orders.map((order) => (
                <div className="container mb-3" key={order.id}>
                  <OrderCard order={order} />
                </div>
              ))
            )}
          </div>
        </div>

        <OrderProductsCard />
      </div>
    </div>
  );
};

export default OrdersView;
