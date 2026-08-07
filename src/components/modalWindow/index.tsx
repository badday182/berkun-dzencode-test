"use client";

import React from "react";
import { useAppDispatch } from "@/lib/hooks";
import Modal from "../modal";
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

/** Подтверждение удаления. Разметку окна рисует общая оболочка `Modal`. */
const ModalWindow: React.FC<ModalWindowProps> = (props) => {
  const { isOpen, onClose, title, category } = props;
  const dispatch = useAppDispatch();

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          {/* TODO(1.5): вынести в словари next-intl */}
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
          >
            Удалить
          </button>
        </>
      }
    >
      {/* TODO(1.5): вынести в словари next-intl */}
      <p className="mb-0">
        {category === "order"
          ? "Вы уверены, что хотите удалить этот приход и все его продукты?"
          : "Вы уверены, что хотите удалить этот продукт?"}
      </p>
    </Modal>
  );
};

export default ModalWindow;
