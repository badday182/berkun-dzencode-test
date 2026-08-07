"use client";

import React, { useEffect, useRef } from "react";
import { useAppDispatch } from "@/lib/hooks";

import styles from "./index.module.css";
import {
  removeOrder,
  removeProduct,
} from "@/lib/features/dataOrdersAndProducts/ordersAndProductsSlice";
import {
  setSelectedOrderId,
  toggleAsideContainer,
} from "@/lib/features/orders/ordersSlice";
import { assertNever, type OrderId, type ProductId } from "@/types";

interface ModalWindowBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

/**
 * Размеченное объединение: `category` определяет тип `id`.
 * Передать `ProductId` вместе с `category: "order"` теперь не даст компилятор.
 */
export type ModalWindowProps = ModalWindowBaseProps &
  ({ category: "order"; id: OrderId } | { category: "product"; id: ProductId });

const ModalWindow: React.FC<ModalWindowProps> = (props) => {
  const { isOpen, onClose, title, category } = props;
  const dispatch = useAppDispatch();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus the close button when modal opens
    closeButtonRef.current?.focus();

    // Add event listener for ESC key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    // Prevent scrolling on the body
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleDelete = () => {
    // Удаление ушло на сервер: thunk сначала дожидается `204`, и только потом
    // редьюсер убирает запись из стора. Каскад по продуктам прихода делает
    // ветка `removeOrder.fulfilled`, поэтому здесь остаётся один диспатч.
    switch (props.category) {
      case "order":
        void dispatch(removeOrder(props.id));
        dispatch(toggleAsideContainer(false));
        dispatch(setSelectedOrderId(null));
        break;
      case "product":
        void dispatch(removeProduct(props.id));
        break;
      default:
        assertNever(props);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop ${styles.modalBackdrop}`} onClick={onClose}>
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                ref={closeButtonRef}
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              {/* TODO(1.5): вынести в словари next-intl */}
              <p>
                {category === "order"
                  ? "Вы уверены, что хотите удалить этот заказ и все его продукты?"
                  : "Вы уверены, что хотите удалить этот продукт?"}
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Отмена
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalWindow;
