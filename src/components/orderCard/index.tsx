"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useConfirm, useOrderStats } from "@/hooks";
import ModalWindow from "../modalWindow";
import styles from "./index.module.css";
import {
  setSelectedOrderId,
  setSelectedOrderTitle,
  toggleAsideContainer,
} from "@/lib/features/orders/ordersSlice";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import { formatDate, formatDateShort } from "@/utils/formatDate";
import type { Order } from "@/types";

export interface OrderCardProps {
  order: Order;
}

/**
 * Карточка прихода в списке.
 *
 * Счётчик продуктов и суммы карточка считает сама через `useOrderStats`:
 * раньше их вычисляла страница и передавала шестью пропсами, хотя данные для
 * этого лежат в сторе и доступны отсюда напрямую.
 */
const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const { id: orderId, title } = order;

  const confirmDelete = useConfirm();
  const t = useTranslations("orders");
  const locale = useLocale();
  const { productsCount, priceUSD, priceUAH } = useOrderStats(orderId);
  const isOpenAsideContainer = useAppSelector(
    (state) => state.orders.isOpenAsideContainer
  );
  const selectedOrderId = useAppSelector(
    (state) => state.orders.selectedOrderId
  );

  const isSelected = selectedOrderId === orderId;

  const dispatch = useAppDispatch();
  return (
    <>
      <div
        className={clsx(
          "card shadow-sm d-flex flex-row justify-content-between align-items-center",
          styles.card,
          {
            "bg-primary-subtle": isSelected,
            "transition-shadow": true,
            "hover-shadow-lg": true,
          }
        )}
      >
        <div
          className={`card-body ${styles.cardContent}`}
          onClick={() => {
            dispatch(toggleAsideContainer(true));
            dispatch(setSelectedOrderId(orderId));
            dispatch(setSelectedOrderTitle(title));
          }}
        >
          <div className="d-flex justify-content-between align-items-center gap-5">
            <div
              className={`d-flex flex-grow-1 justify-content-between align-items-center gap-5`}
            >
              {!isOpenAsideContainer && (
                <h5 className="card-title flex-grow-1 m-0">{title}</h5>
              )}
              <div className="flex-shrink-0 text-muted">
                {/* Плюрализация — на стороне ICU: у русского и украинского
                    три формы, у английского две, и в разметке этого знать не
                    нужно. */}
                {t("productsCount", { count: productsCount })}
              </div>
              <div className="d-flex flex-column align-items-center flex-shrink-0">
                <div className="text-muted">{formatDateShort(order.date)}</div>
                <div className="text-muted fs-5">
                  {formatDate(order.date, locale)}
                </div>
              </div>
              {!isOpenAsideContainer && (
                <div className="d-flex flex-column">
                  <div className="text-muted fs-6">{priceUSD} USD</div>
                  <div className="text-muted fw-medium fs-5">
                    {priceUAH} UAH
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {isSelected ? (
          <i className="bi bi-play-fill text-info fs-4 pe-2"></i>
        ) : (
          <button className="btn btn-sm" onClick={confirmDelete.open}>
            <i className={`bi bi-trash pe-2 ${styles.icon}`}></i>
          </button>
        )}
      </div>

      {confirmDelete.isOpen && (
        <ModalWindow
          isOpen={confirmDelete.isOpen}
          onClose={confirmDelete.close}
          title={t("deleteTitle", { title })}
          category="order"
          id={orderId}
        />
      )}
    </>
  );
};

export default OrderCard;
