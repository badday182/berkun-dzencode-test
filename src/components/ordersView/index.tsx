"use client";

import clsx from "clsx";
import { useAppSelector } from "@/lib/hooks";
import { useOrders, useProducts } from "@/hooks";
import OrderCard from "../orderCard";
import OrderProductsCard from "../orderProductsCard";
import CardPlaceholder from "../cardPlaceholder";
import AddOrderButton from "../forms/addOrderButton";
import styles from "./index.module.css";

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
    <div className={styles.page}>
      <div className={styles.page__header}>
        {/* TODO(1.5): вынести в словари next-intl */}
        <div>
          <h1 className={styles.page__title}>Приходы</h1>
          <p className={styles.page__subtitle}>
            {isLoading ? "Загрузка…" : `Всего: ${orders.length}`}
          </p>
        </div>
        <AddOrderButton />
      </div>

      {error && (
        <div
          className="alert alert-danger d-flex align-items-center justify-content-between gap-3"
          role="alert"
        >
          {/* TODO(1.5): вынести в словари next-intl */}
          <span>Не удалось загрузить данные: {error.message}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger flex-shrink-0"
            onClick={retry}
          >
            Повторить
          </button>
        </div>
      )}

      <div className={styles.layout}>
        {/* Класс модуля добавляется условием: `{ [styles.x]: cond }` под
            `noUncheckedIndexedAccess` невозможен, а строковый литерал `orders`
            (как было до фазы 1.4) просто не соответствовал хешированному
            классу — из-за этого ширина колонки никогда не применялась. */}
        <div
          className={clsx(
            styles.list,
            isOpenAsideContainer && styles.list_narrow
          )}
        >
          {isLoading ? (
            <div className="d-flex flex-column gap-3">
              {placeholders.map((_, index) => (
                <CardPlaceholder key={`placeholder-${index}`} />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            // TODO(1.5): вынести в словари next-intl
            <div className="alert alert-info mb-0">
              Приходов пока нет. Добавьте первый.
            </div>
          )}
        </div>

        <OrderProductsCard />
      </div>
    </div>
  );
};

export default OrdersView;
